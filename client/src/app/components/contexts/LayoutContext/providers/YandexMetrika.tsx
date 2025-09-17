import Script from 'next/script';

const YandexMetrika = () => (
  <>
    <Script
      id="yandex-metrika"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(m,e,t,r,i,k,a){
            m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for(var j=0;j<document.scripts.length;j++) {
              if(document.scripts[j].src === r) return;
            }
            k=e.createElement(t),a=e.getElementsByTagName(t)[0];
            k.async=1;
            k.src='${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL : 'http://localhost:3001/api'}/proxy/metrika/tag.js';
            a.parentNode.insertBefore(k,a);
          })(window, document, 'script', '${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL : 'http://localhost:3001/api'}/proxy/metrika/tag.js', 'ym');

          ym(103542231, 'init', {
            ssr:true,
            webvisor:true,
            trackHash:true,
            clickmap:true,
            ecommerce:"dataLayer",
            accurateTrackBounce:true,
            trackLinks:true
          });
        `,
      }}
    />
    <noscript>
      <div>
        <img
          src={`${process.env.NEXT_PUBLIC_URL ? process.env.NEXT_PUBLIC_API_URL : 'http://localhost:3001/api'}/proxy/metrika/watch/103542231`}
          style={{ position: 'absolute', left: '-9999px' }}
          alt=""
        />
      </div>
    </noscript>
  </>
);

export default YandexMetrika;
