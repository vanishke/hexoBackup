/* global NexT, CONFIG */

NexT.boot = {};

NexT.boot.registerEvents = function() {
  try {
    NexT.utils.registerScrollPercent();
    NexT.utils.registerCanIUseTag();
    NexT.utils.updateFooterPosition();

    // Mobile top menu bar.
    document.querySelector('.site-nav-toggle .toggle').addEventListener('click', event => {
      event.currentTarget.classList.toggle('toggle-close');
      const siteNav = document.querySelector('.site-nav');
      if (!siteNav) return;
      siteNav.style.setProperty('--scroll-height', siteNav.scrollHeight + 'px');
      document.body.classList.toggle('site-nav-on');
    });

    document.querySelectorAll('.sidebar-nav li').forEach((element, index) => {
      element.addEventListener('click', () => {
        NexT.utils.activateSidebarPanel(index);
      });
    });

    window.addEventListener('hashchange', () => {
      const tHash = location.hash;
      if (tHash !== '' && !tHash.match(/%\S{2}/)) {
        const target = document.querySelector(`.tabs ul.nav-tabs li a[href="${tHash}"]`);
        target?.click();
      }
    });

    window.addEventListener('tabs:click', e => {
      NexT.utils.registerCodeblock(e.target);
    });
  } catch (error) {
    console.warn('Something went wrong while NexT registering events', error);
  }
};

NexT.boot.refresh = function() {
  // Isolate optional third-party init so one CDN/runtime failure
  // cannot block core features like codeblock copy buttons.
  const run = (label, fn) => {
    try {
      fn();
    } catch (error) {
      console.warn(`Something went wrong during NexT refresh (${label})`, error);
    }
  };

  run('prism', () => {
    CONFIG.prism && window.Prism?.highlightAll?.();
  });
  run('mediumzoom', () => {
    CONFIG.mediumzoom && window.mediumZoom?.('.post-body :not(a) > img, .post-body > img', {
      background: 'var(--content-bg-color)'
    });
  });
  run('lazyload', () => {
    CONFIG.lazyload && window.lozad?.('.post-body img').observe();
  });
  run('pangu', () => {
    if (!CONFIG.pangu || !window.pangu?.spacingNode) return;
    if (!window.requestIdleCallback) {
      window.requestIdleCallback = function(cb) {
        cb({
          didTimeout   : false,
          timeRemaining: () => 100
        });
      };
    }
    [...document.getElementsByTagName('main')].forEach(e => window.pangu.spacingNode(e));
  });
  run('exturl', () => {
    CONFIG.exturl && NexT.utils.registerExtURL();
  });
  run('tables', () => {
    NexT.utils.wrapTableWithBox();
  });
  run('codeblock', () => {
    NexT.utils.registerCodeblock();
  });
  run('tabs', () => {
    NexT.utils.registerTabsTag();
  });
  run('menu', () => {
    NexT.utils.registerActiveMenuItem();
  });
  run('lang', () => {
    NexT.utils.registerLangSelect();
  });
  run('toc', () => {
    NexT.utils.registerSidebarTOC();
  });
  run('reward', () => {
    NexT.utils.registerPostReward();
  });
  run('video', () => {
    NexT.utils.registerVideoIframe();
  });
};

NexT.boot.motion = function() {
  // Define Motion Sequence & Bootstrap Motion.
  if (CONFIG.motion.enable) {
    try {
      NexT.motion.integrator
        .add(NexT.motion.middleWares.header)
        .add(NexT.motion.middleWares.sidebar)
        .add(NexT.motion.middleWares.postList)
        .add(NexT.motion.middleWares.footer)
        .bootstrap();
    } catch (error) {
      console.warn('NexT Motion Error, fallback to static mode', error);
      document.body.classList.remove('use-motion');
      CONFIG.motion.enable = false;
    }
  }
  NexT.utils.updateSidebarPosition();
};

document.addEventListener('DOMContentLoaded', () => {
  NexT.boot.registerEvents();
  NexT.boot.refresh();
  NexT.boot.motion();
});
