(() => {
    let head = document.getElementsByTagName('head')[0];

    // jquery and popper.js
    let bootstrapDependencies = [
        "https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js"
    ];

    // external stylesheets to be included in the head element
    let stylesCSS = [
        "https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.3/css/bootstrap.min.css",
        "https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"
    ];

    // external js scripts to be included in the head element
    let jsscripts = [
        "https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.3/js/bootstrap.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.4/socket.io.js",
        "js/script-loader.js"
    ];

    // first load js scripts
    // for each script in bootstrapDependencies array create a script element dynamically and append it to the head element
    for (let i = 0; i < bootstrapDependencies.length; ++i) {
        let scriptTag = document.createElement('script');
        // src attribute of the script element
        scriptTag.src = bootstrapDependencies[i];
        scriptTag.setAttribute('text', 'text/javascript');
        head.appendChild(scriptTag);
    }

    // second load bootstrap css
    // create a link element dynamically for bootstrap css and append it to the head element
    for (let i = 0; i < stylesCSS.length; ++i) {
        let stylesheet = document.createElement('link');
        stylesheet.href = stylesCSS[i];
        stylesheet.setAttribute('rel', 'stylesheet');
        stylesheet.setAttribute('type', 'text/css');
        head.appendChild(stylesheet);
    }

    // third load main js scripts
    // for each script in js scripts array create a script element dynamically and append it to the head element
    for (let i = 0; i < jsscripts.length; ++i) {
        let scriptTag = document.createElement('script');
        // src attribute of the script element
        scriptTag.src = jsscripts[i];
        scriptTag.setAttribute('text', 'text/javascript');
        head.appendChild(scriptTag);
    }
})();