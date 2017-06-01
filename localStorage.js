const CONTENT_KEY = "seqans-content"

let localStorage = window.localStorage

function saveContentToStorage(str) {
    return localStorage.setItem(CONTENT_KEY, str)
}

function getContentFromStorage() {
    if(localStorage.getItem(CONTENT_KEY)) {
        return localStorage.getItem(CONTENT_KEY)
    }
    return defaultContent;
}