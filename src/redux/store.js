import { createStore } from 'redux';
import uuid from 'uuid/v4';

const initialState = {
  imageupload: [{id: uuid}]
};

export const store = createStore(
  reducer,
  initialState,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

function reducer(state, { type, payload }) {
  switch(type){
    case 'ADD_IMAGE':
      console.log("PAYLOAD ADD IMAGE: ", payload);

      return {
        ...state,
        imageupload: [...state.imageupload, payload]
      };
    case 'DELETE_IMAGE':
      console.log("ImageloadUpload DELETE_IMAGE: ", state.imageupload);
      console.log("PAYLOAD DELETE IMAGE: ", payload);
       return {
         ...state,
         imageupload: [...state.imageupload, payload] //filter(images => images.id !== payload)
    };
    case 'CLEAR_STORE':
      return initialState;
    default:
        return state;
  }
}

export const addImageAction = imageupload => ({
         type: "ADD_IMAGE",
         payload: imageupload
       });

export const deleteImageAction = imageupload => ({
          type: "DELETE_IMAGE",
          payload: imageupload
        });

export const clearAction = storeClear => ({
          type: "CLEAR_STORE",
          payload: storeClear
});