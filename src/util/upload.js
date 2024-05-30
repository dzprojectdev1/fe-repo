import Global from '../components/Global';
import { SERVER_URL } from '../config/constants';

export function uploadPhoto(file) {
  const formData = new FormData();
  formData.append("fileData", {
    uri: file?.assets[0]?.uri,
    type: file?.assets[0]?.type,
    name: file?.assets[0]?.fileName,
  });

  return fetch(`${SERVER_URL}/api/upload/userPhoto`, {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': Global.saveData.token,
      'Content-Type': 'multipart/form-data',
    },
  })
    .then(res => res.json())
    .catch(err => {
      console.log(err);
    });
}