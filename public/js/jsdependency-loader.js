(() => {
  let head = document.getElementsByTagName('head')[0];
  
  // external scripts to be included in the head element
  let scripts = [
    "https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.4/socket.io.js",
    "https://code.jquery.com/jquery-3.2.1.slim.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js",
    "https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.3/js/bootstrap.min.js"
  ];
  
  // external stylesheets to be included in the head element
  let bootstrapCSS = "https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.3/css/bootstrap.min.css";
  
  // first load css
  
  // create a link element dynamically for bootstrap css and append it to the head element
  let stylesheet = document.createElement('link');
  stylesheet.href = bootstrapCSS;
  stylesheet.setAttribute('rel', 'stylesheet');
  stylesheet.setAttribute('type', 'text/css');
  head.appendChild(stylesheet);

  // then load js scripts
  
  // for each script in scripts array create a script element dynamically and append it to the head element
  for (let i = 0; i < scripts.length; ++i) {
    let scriptTag = document.createElement('script');
    // src attribute of the script element
    scriptTag.src = scripts[i];
    scriptTag.setAttribute('text', 'text/javascript');
    head.appendChild(scriptTag);
  }
})();