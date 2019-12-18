import Global from '../components/Global';
import { SERVER_URL } from '../config/constants';

export function uploadVideo(file) {
  const formData = new FormData();

  formData.append("fileData", {
    uri: file.uri,
    type: file.type,
    name: file.fileName,
  });

  return fetch(`${SERVER_URL}/api/upload/userVideo`, {
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