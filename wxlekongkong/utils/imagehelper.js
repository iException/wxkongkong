//返回格式 {left: 左边距, top: 顶边距, isBig: 是否是大图}
function calculatedDefaultFlowImagesSize(images, hInteval) {
    if (!images || images.length == 0) {
        return []
    }

    for (let i = 0; i < images.length; i++) {
        let image = images[i]
        image.left = hInteval
        image.top = i==0 ? 0 : hInteval
        image.isBig = (images.length % 2 == 0) ? (i < 2) : (i < 3)
    }
    return images
}

function calculateLoadedFlowImagesSize(loadedImage, loadedImageSize, images, realWindowWidth) {
    var endIdx = 0
    var startIdx = 0

    if (loadedImage.isBig) {
      if(images.length < 3) {
        endIdx = images.length
      } else {
        endIdx = images.length % 2 == 0 ? 2 : 3
      }
    } else {
      startIdx = images.length % 2 == 0 ? 2 : 3
      endIdx = images.length
    }

    var viewWidth = 0
    var viewHeight = 0
    var inteval = loadedImage.left
    if (loadedImage.isBig) {
      viewWidth = realWindowWidth - inteval * 2
      var imgWidth = loadedImageSize.width
      var imgHeight = loadedImageSize.height
      viewHeight = ( imgHeight / imgWidth ) * viewWidth
    } else {
      viewHeight = viewWidth = (realWindowWidth - inteval * 3) * 0.5;
    }

    for (var i = startIdx; i < endIdx; i++) {
      var img = images[i]
      img.width = viewWidth
      img.height = viewHeight
    }

    return images
}

function calculateDefaultTopicImagesSize(images, hInteval) {

}

function calculateLoadedTopicImagesSize(images, realWindowWidth, hInteval) {

}

module.exports = {
    calculateLoadedFlowImagesSize: calculateLoadedFlowImagesSize,
    calculatedDefaultFlowImagesSize: calculatedDefaultFlowImagesSize
}