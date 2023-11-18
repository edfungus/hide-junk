console.log("hide-junk loaded")

MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

const findWithInterval = (find, op, i, max, delay) => {
    if (i > max) {
        return
    }
    const results = find()
    if (results.length == 0) {
        setTimeout(() => {
            findWithInterval(find, op, i + 1, max, delay)
        }, delay)
    } else {
        op(results)
    }
}

// findAndRemove searches through a parent to find matching nodes which are passed to the removeFn.
// Will attempt multiple times to find the parent node (for lazy loading) and will listen for all changes on parent to catch new content
const findAndRemove = (parentSelector, matchSelector, removeFn) => {
    // Add handle to catch new updates
    const observer = new MutationObserver(function (mutations, observer) {
        mutations.forEach((record) => {
            if (record.target.matches(matchSelector)) {
                removeFn(record.target)
            }
        })
    });

    // Find parent which might be lazy loaded
    findWithInterval(
        () => document.querySelectorAll(parentSelector),
        (elems) => {
            elems.forEach((elem) => {
                // add observer for future changes
                observer.observe(elem, {
                    subtree: true,
                    attributes: true
                });

                // remove from existing
                elem.querySelectorAll(matchSelector).forEach(removeFn)
            })
        },
        1,
        5,
        200
    )
}

const getBlockedIDsForSite = (site, callback) => {
    let request = {}
    request[site] = []
    chrome.storage.sync.get(request,
        (items) => {
            callback(items[site])
        }
    );
}

const host = window.location.hostname

if (host == "www.google.com") {
    getBlockedIDsForSite(host, (blockedIDs) => {
        if (!blockedIDs || blockedIDs.length == 0) {
            return
        }
        console.log(blockedIDs)
        findAndRemove("#center_col", "cite", (elem) => {
            if (blockedIDs.includes(elem.childNodes[0].textContent)) {
                if (elem.closest("div[jscontroller][jsaction].g")) {
                    elem.closest("div[jscontroller][jsaction].g").remove()
                }
            }
        })
    })
}

if (host == "www.youtube.com") {
    getBlockedIDsForSite(host, (blockedIDs) => {
        if (!blockedIDs || blockedIDs.length == 0) {
            return
        }

        // For youtube search page
        findAndRemove("ytd-search", "yt-formatted-string.ytd-channel-name", (elem) => {
            if (blockedIDs.includes(elem.getAttribute("title"))) {
                if (elem.closest("ytd-video-renderer")) {
                    elem.closest("ytd-video-renderer").remove()
                }
            }
        })

        // For youtube subscription page
        findAndRemove("ytd-page-manager", "yt-formatted-string.ytd-channel-name", (elem) => {
            if (blockedIDs.includes(elem.getAttribute("title"))) {
                if (elem.closest("ytd-rich-item-renderer")) {
                    elem.closest("ytd-rich-item-renderer").remove()
                }
            }
        })

        // For video page
        findAndRemove("ytd-watch-next-secondary-results-renderer", "yt-formatted-string.ytd-channel-name", (elem) => {
            if (blockedIDs.includes(elem.getAttribute("title"))) {
                if (elem.closest("ytd-compact-video-renderer")) {
                    elem.closest("ytd-compact-video-renderer").remove()
                }
            }
        })

        // For comments
        findAndRemove("ytd-comments", "yt-formatted-string.ytd-comment-renderer", (elem) => {
            if (blockedIDs.includes(elem.textContent)) {
                // Top level comments
                if (elem.closest("ytd-comment-thread-renderer") && !elem.closest("ytd-comment-replies-renderer")) {
                    elem.closest("ytd-comment-thread-renderer").remove()
                }
                // Threaded comments
                if (elem.closest("ytd-comment-renderer")) {
                    elem.closest("ytd-comment-renderer").remove()
                } else {

                }
            }
        })

        // For trending page
        findAndRemove("ytd-browse", "yt-formatted-string.ytd-channel-name", (elem) => {
            if (blockedIDs.includes(elem.getAttribute("title"))) {
                if (elem.closest("ytd-shelf-renderer")) {
                    elem.closest("ytd-shelf-renderer").remove()
                }
            }
        })


    })
}


