let videoFileArray = []
let accessToken = "s"

// изменение кнопки прикрепления файлов (возможностб прикреплять mp4 файлы)
setTimeout(function() {
    // const zakrep = document.getElementsByClassName("wall-post-form__file-input svelte-vw1v4s")
    // if (zakrep.length > 0) {
    //     zakrep[0].accept = "video/mp4,image/*"
    // }

    const zakrep = document.getElementsByClassName("wall-post-form__attach svelte-vw1v4s")
    if (zakrep.length > 0) {
        const but = document.createElement("button")
        but.className = "wall-post-form__attach-btn svelte-vw1v4s"
        but.title = "Прикрепить видео"
        but.innerHTML = `
            <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 111.34"><path d="M23.59,0h75.7a23.68,23.68,0,0,1,23.59,23.59V87.75A23.56,23.56,0,0,1,116,104.41l-.22.2a23.53,23.53,0,0,1-16.44,6.73H23.59a23.53,23.53,0,0,1-16.66-6.93l-.2-.22A23.46,23.46,0,0,1,0,87.75V23.59A23.66,23.66,0,0,1,23.59,0ZM54,47.73,79.25,65.36a3.79,3.79,0,0,1,.14,6.3L54.22,89.05a3.75,3.75,0,0,1-2.4.87A3.79,3.79,0,0,1,48,86.13V50.82h0A3.77,3.77,0,0,1,54,47.73ZM7.35,26.47h14L30.41,7.35H23.59A16.29,16.29,0,0,0,7.35,23.59v2.88ZM37.05,7.35,28,26.47H53.36L62.43,7.38v0Zm32,0L59.92,26.47h24.7L93.7,7.35Zm31.32,0L91.26,26.47h24.27V23.59a16.32,16.32,0,0,0-15.2-16.21Zm15.2,26.68H7.35V87.75A16.21,16.21,0,0,0,12,99.05l.17.16A16.19,16.19,0,0,0,23.59,104h75.7a16.21,16.21,0,0,0,11.3-4.6l.16-.18a16.17,16.17,0,0,0,4.78-11.46V34.06Z"/></svg>
        `
        but.onclick = function() {
            video.click()
        }
        zakrep[0].appendChild(but)

        const bob = document.createElement("button")
        bob.className = "wall-post-form__file-input svelte-vw1v4s"
        bob.onclick = function() {
            preview.click()
            alert("Если у вас не появляется окно выбора файла превью в течении 10 секунд, то перезагрузите страницу и повторите действия ещё раз!")
        }
        bob.id = "trilion-money"
        zakrep[0].appendChild(bob)

        const video = document.createElement("input")
        video.type = "file"
        video.className = "wall-post-form__file-input svelte-vw1v4s"
        video.accept = "video/mp4"
        video.multiple = false
        video.id = "trilion-dollar-file"
        zakrep[0].appendChild(video)

        const preview = document.createElement("input")
        preview.type = "file"
        preview.className = "wall-post-form__file-input svelte-vw1v4s"
        preview.accept = "image/png"
        preview.multiple = false
        preview.id = "trilion-dollar-preview"
        zakrep[0].appendChild(preview)

        getToken()

        setupVideo()
    }
}, 2000)

function getToken() {
    fetch("/api/v1/auth/refresh", { method: "POST" })
        .then(response => response.json())
        .then(data => {
            accessToken = data.accessToken
        }).catch(error => {
            console.error("Ошибка: ", error)
        })
}

function intToUInt8(number) {
    const buffer = new ArrayBuffer(4)
    const view = new DataView(buffer)
    view.setInt32(0, number, false)
    return new Uint8Array(buffer)
}

function uInt8ToInt(array) {
    const view = new DataView(array.buffer)
    const it = view.getInt32(0, false)
    return it
}

function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
}

async function getFileBytes(url) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        action: 'downloadFile',
        url: url
      },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError.message)
        } else if (response?.success) {
          resolve(new Uint8Array(response.data))
        } else {
          reject(response?.error || 'Неизвестная ошибка')
        }
      }
    )
  })
}

async function publicVideo(imageId) {
    try {
        await fetch("/api/posts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: `{"content":"","attachmentIds":["${imageId}"]}`,
        }).then(response => {
            window.location.reload()
        })
    } catch (err) {
        console.log("ERROR: ", err)
    }
}

async function onPreviewSave(previewFileArray) {
    const previewLenght = intToUInt8(previewFileArray.length)
    const newArray = new Uint8Array([...previewFileArray, ...videoFileArray, ...previewLenght, 255])
    const blob = new Blob([newArray], { type: 'image/png' })
    // console.log(blob)

    alert("Публикация видео начата")

    const fd = new FormData()
    fd.append("file", blob, crypto.randomUUID()+".png")

    try {
        await fetch("/api/files/upload", {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}` },
            body: fd,
        })
        .then(response => response.json())
        .then(data => {
            publicVideo(data.id)
        })
    } catch (err) {
        console.log("ERROR: ", err)
    }
}

function setupVideo() {
    const inputVideo = document.getElementById("trilion-dollar-file")
    const inputPreview = document.getElementById("trilion-dollar-preview")
    const reader = new FileReader()
    const previewFileArray = []
    videoFileArray = []

    inputVideo.addEventListener('change', (e) => {
        reader.readAsArrayBuffer(e.target.files[0])
        reader.onloadend = (evt) => {
            if (evt.target.readyState === FileReader.DONE) {
            const arrayBuffer = evt.target.result
                array = new Uint8Array(arrayBuffer)
            for (const a of array) {
                videoFileArray.push(a)
            }
                document.getElementById("trilion-money").click()
            }
        }
    })

    inputPreview.addEventListener('change', (e) => {
        reader.readAsArrayBuffer(e.target.files[0])
        reader.onloadend = (evt) => {
            if (evt.target.readyState === FileReader.DONE) {
            const arrayBuffer = evt.target.result
                array = new Uint8Array(arrayBuffer)
            for (const a of array) {
                previewFileArray.push(a)
            }
                onPreviewSave(previewFileArray)
            }
        }
    })
}

// при открытии видео на фулл, заменяет тег фотографии на тег видео (для просмотра видео)
let lol = false
const config = {
    attributes: true,
    attributeFilter: ['style']
}
const callback = function(mutationsList, observer) {
    for(const mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            if (!lol) {
                lol = true
                setTimeout(function() {
                    const imgFull = document.getElementsByClassName("image-viewer__slide svelte-nusr1p")
                    if (imgFull.length > 0) {
                        const imgSrc = imgFull[0].children[0].currentSrc
                        const b = document.createElement("p")
                        b.textContent = "Делаю загрузку для проверки это фото или видео. НЕ ЗАКРЫВАЙТЕ ДАННУЮ КАРТИНКУ И ДРУГУЮ ВКЛАДКУ ДО КОНЦА ЗАГРУЗКИ!"
                        b.id = "super-simple-228"
                        b.style = "text-align: center; z-index: 1000;"
                        imgFull[0].parentElement.appendChild(b)

                        getFileBytes(imgSrc)
                        .then(bytearray => {
                            console.log(bytearray)
                            
                            if (bytearray[bytearray.length - 1] == 255) {

                                const idArray = bytearray.slice(
                                    bytearray.length - 5,
                                    bytearray.length - 1,
                                )
                                let idVideoStart = uInt8ToInt(
                                    new Uint8Array(idArray),
                                )


                                if (arraysEqual(bytearray.slice(idVideoStart, idVideoStart+7), new Uint8Array([0,0,0,32,102,116,121]))) {
                                    idVideoStart = idVideoStart
                                } else {
                                    idVideoStart = idVideoStart-68
                                }

                                const videoBytes = bytearray.slice(
                                    idVideoStart,
                                    bytearray.length - 5,
                                ).buffer

                                console.log(videoBytes, idVideoStart, bytearray.length)
                                
                                const blob = new Blob([videoBytes], { type: 'video/mp4' })
                                const videoUrl = URL.createObjectURL(blob)
                                // const base64Data = btoa(String.fromCharCode(...vb))
                                // const dataUrl = `data:video/mp4сщтbase64,${base64Data}`

                                console.log(videoUrl)
                                
                                const video = document.createElement("video")
                                video.controls = true
                                video.className = "image-viewer__image svelte-nusr1p"

                                const sourceElement = document.createElement("source")
                                sourceElement.src = videoUrl
                                sourceElement.type = "video/mp4"
                                video.appendChild(sourceElement)

                                imgFull[0].children[0].remove()
                                imgFull[0].appendChild(video)

                                video.load()
                            }
                            b.remove()
                        })

                        // if (imgSrc.slice(-3) == "mp4") {
                        // }
                    }
                    lol = false
                }, 350)
            }
        }
    }
}

const observer = new MutationObserver(callback)
observer.observe(document.body, config)

// document.addEventListener('click', function(event) {
// })
