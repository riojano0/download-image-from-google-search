browser.contextMenus.create({
    id: "download-image-gs",
    title: "Download original image",
    contexts: ["image"],
    targetUrlPatterns: ["*://*.google.com/url?*"]
})

const downloadImage = async (imageSrc, imageName) => {
    try {
        const downloadingId = await browser.downloads
            .download({
                url: imageSrc,
                filename: imageName,
                conflictAction: 'uniquify'
            })
        console.log(`Started downloading: ${downloadingId}`);
    } catch (error) {
        console.log(`Download failed: ${error}`);
    }
}

let extraTabOpen;

const handleClick = async (info, tab) => {
    if (info.menuItemId === "download-image-gs") {
        let imageLink = info['srcUrl'];

        if (imageLink.indexOf('data:') === -1) {
            const imageName = imageLink.split(/(\\|\/)/g).pop()

            downloadImage(imageLink, imageName);
        } else {
            const linkUrl = info['linkUrl'];
            extraTabOpen = await browser.tabs.create({url: linkUrl});

            try {
                /*
                 TODO: Remove the /url? part from the targetUrlPatterns and allow to open the next tab, 
                 and get the correct ImageSrc before close
                */
                let executingScript = await browser.tabs.executeScript(extraTabOpen.id, {
                    file: "./content-script.js"
                })
            } catch (error) {
                console.log(error);
            }

        }
        
    }
}

browser.contextMenus.onClicked.addListener(handleClick);

function handleMessage(request, sender, sendResponse) {

    if (request && request.imageSrc) {
        console.log("Message from the content script: " + request.imageSrc);
        const imageName = request.imageSrc.split(/(\\|\/)/g).pop()
        downloadImage(request.imageSrc, imageName);
        browser.tabs.remove(extraTabOpen.id)
    }
    sendResponse({response: "You can be closed now"});
}
browser.runtime.onMessage.addListener(handleMessage);