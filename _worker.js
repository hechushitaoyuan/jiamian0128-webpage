export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);

    try {
      // 动态获取配置文件
      const configFile = await env.ASSETS.fetch(new Request(new URL('/config.json', url.origin)));
      if (!configFile.ok) throw new Error('Configuration file not found.');
      const config = await configFile.json();

      if (pathSegments.length > 0) {
        const prefix = pathSegments[0];
        const service = config.services.find(s => s.prefix === prefix);

        if (service) {
          // --- 1. 构造发往后端的请求 ---
          const targetHost = `${service.prefix}.${config.base_tunnel_domain}`;
          const newPath = '/' + pathSegments.slice(1).join('/') + url.search;
          const targetUrl = new URL(newPath, `https://${targetHost}`);
          
          const newRequest = new Request(targetUrl, request);
          newRequest.headers.set('Host', targetHost);
          
          const response = await fetch(newRequest);

          // --- 2. 处理后端的响应 ---
          // 2.1 处理重定向 (Location Header)
          const location = response.headers.get('Location');
          if (location) {
            const newLocation = `/${prefix}${new URL(location).pathname}`;
            const newHeaders = new Headers(response.headers);
            newHeaders.set('Location', newLocation);
            return new Response(response.body, {
              status: response.status,
              statusText: response.statusText,
              headers: newHeaders,
            });
          }

          // 2.2 如果是HTML内容，则重写所有链接
          const contentType = response.headers.get('Content-Type');
          if (contentType && contentType.includes('text/html')) {
            // 辅助函数，用于重写元素的属性
            const rewriteElementAttribute = (attributeName) => ({
              element(element) {
                const attr = element.getAttribute(attributeName);
                if (attr && attr.startsWith('/')) {
                  element.setAttribute(attributeName, `/${prefix}${attr}`);
                }
              },
            });

            const rewriter = new HTMLRewriter()
              .on('a', rewriteElementAttribute('href'))
              .on('link', rewriteElementAttribute('href'))
              .on('script', rewriteElementAttribute('src'))
              .on('img', rewriteElementAttribute('src'))
              .on('form', rewriteElementAttribute('action'));

            return rewriter.transform(response);
          }
          
          // 2.3 其他类型的内容 (图片, CSS, JS文件等) 直接返回
          return response;
        }
      }

      // 如果没有匹配的路径，则提供静态主页
      return env.ASSETS.fetch(request);

    } catch (e) {
      return new Response(`Error: ${e.message}`, { status: 500 });
    }
  },
};
