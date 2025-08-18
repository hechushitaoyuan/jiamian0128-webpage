export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const hostname = url.hostname;

    try {
      // 动态获取配置文件
      const configFileUrl = new URL('/config.json', url.origin);
      const configFile = await env.ASSETS.fetch(new Request(configFileUrl));
      if (!configFile.ok) {
        return new Response('Configuration file not found.', { status: 500 });
      }
      const config = await configFile.json();

      // 从主机名中提取子域名前缀
      const subdomain = hostname.split('.')[0];
      
      // 在配置的服务列表中查找匹配项
      const service = config.services.find(s => s.prefix === subdomain);

      if (service) {
        // 如果找到匹配的服务，则进行代理
        const targetHost = `${service.prefix}.${config.base_tunnel_domain}`;
        const newRequest = new Request(request);
        newRequest.headers.set('Host', targetHost);
        
        // 交给 Tunnel 处理请求
        return fetch(newRequest);

      } else if (hostname === config.base_pages_domain) {
        // 如果访问的是主域名，则提供静态网站内容
        return env.ASSETS.fetch(request);
      }

      // 如果是其他未定义的子域名，返回404
      return new Response(`Subdomain "${subdomain}" not found in configuration.`, { status: 404 });

    } catch (e) {
      // 如果配置文件解析失败或有其他错误，返回服务器错误
      return new Response(`Error processing request: ${e.message}`, { status: 500 });
    }
  },
};