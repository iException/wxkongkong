//返回格式 {left: 左边距, top: 顶边距, isBig: 是否是大图}
function calculatedDefaultFlowImagesSize(images, hInteval, vInteval, realWindowWidth) {
    if (!images || images.length == 0) {
        return []
    }

    for (let i = 0; i < images.length; i++) {
      let image = images[i]
      image.top = vInteval

      //偶数
        if (images.length % 2 == 0) {
          image.left = true ? hInteval : vInteval
          if (i < 2) {
            image.isBig = true
            image.left = hInteval
            image.height = image.width =  realWindowWidth - 2 * hInteval
          } else {
            image.isBig = false
            image.left = (i % 2 == 0) ? hInteval : vInteval
            image.height = image.width = (realWindowWidth - 2 * hInteval - vInteval) * 0.5
          }
        } else {
          image.left = true ? hInteval : vInteval;
          if (i < 3) {
            image.isBig = true
            image.left = hInteval
            image.height = image.width =  realWindowWidth - 2 * hInteval
          } else {
            image.isBig = false
            image.left = (i % 2 == 1) ? hInteval : vInteval
            image.height = image.width = (realWindowWidth - 2 * hInteval - vInteval) * 0.5
          }
        }
    }
    return images
}

function calculateDefaultTopicImagesSize(images, edgeInteval, hInteval, vInteval, windowWidth) {
  if (!images || images.length == 0) {
    return
  }

  let count = images.length
  for(let i = 0; i < count; i++) {
    let image = images[i]
    let width = (windowWidth - 2 * edgeInteval - 2 * hInteval) / 3.0
  
    if (count == 1) {
      image.hInteval = 0
      image.vInteval = 0
      image.height = image.width = image.height = width * 2 + hInteval
    } else if (count == 4) {
      image.vInteval = i < 2 ? vInteval : 0
      image.height = image.width = image.height = width
      image.hInteval = ((i + 1) % 2) == 0 ? (windowWidth - 2 * edgeInteval - 2 * width - hInteval) : hInteval
    } else {
      image.height = image.width = width
      image.hInteval = ((i + 1) % 3) == 0 ? 0 : hInteval

      if (count <= 3) {
        image.vInteval = 0
      }
      else if (count > 3 && count <= 6) {
        image.vInteval = i < 3 ? vInteval : 0
      } else {
        image.vInteval = i < 6 ? vInteval : 0
      }
    }
  }
}

module.exports = {
    calculatedDefaultFlowImagesSize: calculatedDefaultFlowImagesSize,
    calculateDefaultTopicImagesSize: calculateDefaultTopicImagesSize
}