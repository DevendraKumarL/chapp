(() => {
  let head = document.getElementsByTagName('head')[0];

  // client scripts to be loaded => app logic
  let scripts = [
    "js/client.js"
    // "js/app-init.js"
  ];

  // client stylesheets to be loaded => custom css
  let styles = [
    "css/style.css"
  ];

  // for each script in scripts array create a script element dynamically and append it to the head element
  for (let i = 0; i < scripts.length; ++i) {
    let scriptTag = document.createElement('script');
    // src attribute of the script element
    scriptTag.src = scripts[i];
    scriptTag.setAttribute('text', 'text/javascript');
    head.appendChild(scriptTag);
  }

  // for each stylesheet in styles array create a link element dynamically and append it to the head element
  for (let i = 0; i < styles.length; ++i) {
    let stylesheet = document.createElement('link');
    // href attribute of the link element
    stylesheet.href = styles[i];
    stylesheet.setAttribute('text', 'text/css');
    stylesheet.setAttribute('rel', 'stylesheet');
    head.appendChild(stylesheet);
  }
})();
