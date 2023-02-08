import { createStore } from 'redux'
//import { v4 as uuid } from 'uuid'

const initialState = {
  imageupload: { imgUploadState: false }, //{ id: uuid }
  imgUploadState: false,
  state: { imgUploadState: false },
}

export const store = createStore(
  reducer,
  initialState,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
)

function reducer(state, { type, payload }) {
  console.log('Reducer: ', state, type, payload)
  switch (type) {
    case 'ADD_IMAGE':
      return {
        ...state,
        imageupload: [state.imageupload, payload],
      }
    case 'DELETE_IMAGE':
      return {
        ...state,
        imageupload: [...state.imageupload, payload], // filter(images => images.id !== payload)
      }
    case 'IMG_UPLOAD_STATE':
      return {
        state,
        imgUploadState: !state.imgUploadState,
      }
    case 'CLEAR_STORE':
      return initialState
    default:
      return state
  }
}

export const addImageAction = (imageupload) => ({
  type: 'ADD_IMAGE',
  payload: imageupload,
})

export const deleteImageAction = (imageupload) => ({
  type: 'DELETE_IMAGE',
  payload: imageupload,
})

export const ImgUploadStateAction = (imgUploadState) => ({
  type: 'IMG_UPLOAD_STATE',
  payload: imgUploadState,
})

export const clearAction = (storeClear) => ({
  type: 'CLEAR_STORE',
  payload: storeClear,
})
