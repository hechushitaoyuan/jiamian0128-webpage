export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/').filter(Boolean); // 例如: /gb/some/path -> ['gb', 'some', 'path']

    try {
      // 动态获取配置文件
      const configFile = await env.ASSETS.fetch(new Request(new URL('/config.json', url.origin)));
      if (!configFile.ok) throw new Error('Configuration file not found.');
      const config = await configFile.json();

      // 检查是否存在第一个路径段 (例如 "gb")
      if (pathSegments.length > 0) {
        const prefix = pathSegments[0];
        const service = config.services.find(s => s.prefix === prefix);

        if (service) {
          // 如果找到匹配的服务，则进行代理
          const targetHost = `${service.prefix}.${config.base_tunnel_domain}`;
          
          // 构造新的目标URL，保留原始路径和查询参数
          // 例如 /gb/some/path -> https://gb.jiamian0128.dpdns.org/some/path
          const newPath = '/' + pathSegments.slice(1).join('/') + url.search;
          const targetUrl = `https://${targetHost}${newPath}`;

          const newRequest = new Request(targetUrl, request);
          newRequest.headers.set('Host', targetHost);
          
          return fetch(newRequest);
        }
      }

      // 如果没有匹配的路径前缀, 或者直接访问根路径 "/", 则提供静态网站内容 (index.html)
      return env.ASSETS.fetch(request);

    } catch (e) {
      return new Response(`Error: ${e.message}`, { status: 500 });
    }
  },
};
