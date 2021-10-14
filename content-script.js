function sendImageLink(event) {
    console.log('execute')
    const links = document.body.getElementsByTagName('a')
    let imageSrc
    for (let i = 0; links.length; i++) {
        if ("_blank" === links[i].getAttribute('target')) {
            let linkWithImage = links[i];
            let image = linkWithImage.getElementsByTagName('img');
            if (image && image[0].src.indexOf('data:') === -1) {
                imageSrc = image[0].src
                break;
            }
        }
    }

    var sending = browser.runtime.sendMessage({
        imageSrc: imageSrc
    })
    sending.then((message) => {
        console.log(`Message from the background script:  ${message.response}`);
    })
}

setTimeout(sendImageLink, 1000);