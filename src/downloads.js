const isAttachmentDownloadUrl = (url) => {
    return typeof url === 'string' &&
        url.startsWith('https://chat.google.com/') &&
        url.includes('get_attachment_url?url_type=DOWNLOAD_URL');
};

const startAttachmentDownload = (webContents, url) => {
    if (!isAttachmentDownloadUrl(url)) {
        return false;
    }

    webContents.downloadURL(url);
    return true;
};

module.exports = {
    isAttachmentDownloadUrl,
    startAttachmentDownload
};
