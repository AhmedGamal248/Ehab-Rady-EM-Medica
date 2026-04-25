import api from "./api";

function getUploadedUrls(response) {
  const urls = response.data?.data?.urls;

  if (Array.isArray(urls) && urls.length > 0) {
    return urls;
  }

  return [];
}

export async function uploadImages(files) {
  const selectedFiles = Array.from(files || []).filter(Boolean);

  if (selectedFiles.length === 0) {
    return [];
  }

  const formData = new FormData();
  selectedFiles.forEach((file) => formData.append("images", file));

  const response = await api.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  const urls = getUploadedUrls(response);

  if (urls.length === 0) {
    throw new Error("No Cloudinary URL was returned from the upload endpoint");
  }

  return urls;
}
