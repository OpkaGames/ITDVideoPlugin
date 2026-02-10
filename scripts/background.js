// бля сложно

async function downloadFileAsBytes(url) {
  return new Promise(async (resolve, reject) => {
    try {
      const tab = await chrome.tabs.create({
        "url": url,
        active: false
      })
      
      await new Promise(resolve => {
        chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
          if (tabId === tab.id && info.status === 'complete') {
            chrome.tabs.onUpdated.removeListener(listener)
            resolve()
          }
        })
      })
      
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: async (fileUrl) => {
          const response = await fetch(fileUrl)
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
          }
          const arrayBuffer = await response.arrayBuffer()
          return Array.from(new Uint8Array(arrayBuffer))
        },
        args: [url]
      })
      
      await chrome.tabs.remove(tab.id)
      
      if (results && results[0] && results[0].result) {
        resolve(new Uint8Array(results[0].result))
      } else {
        reject(new Error('Не удалось скачать файл'))
      }
      
    } catch (error) {
      console.error('Ошибка:', error)
      reject(error)
    }
  })
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'downloadFile') {
    downloadFileAsBytes(request.url)
      .then(bytes => {
        sendResponse({
          success: true,
          data: Array.from(bytes),
          length: bytes.length
        })
      })
      .catch(error => {
        sendResponse({
          success: false,
          error: error.message
        })
      })
    return true
  }
})