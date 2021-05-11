//add new input form when click plus button
let addInputFormCount = 0;
function addInputForm () {
  let inputFormParent = document.querySelector(".row2")
  if (addInputFormCount < 1) {
    addInputFormCount += 1;
    let inputFormWithButtonTemp = document.querySelector("#inputFormWithButton");
    let clon1 = inputFormWithButtonTemp.content.cloneNode(true);
    inputFormParent.appendChild(clon1);
  } else if (addInputFormCount == 1) {
    addInputFormCount += 1;
    let inputFormNoButtonTemp = document.querySelector("#inputFormNoButton");
    let clon2 = inputFormNoButtonTemp.content.cloneNode(true);
    inputFormParent.appendChild(clon2);
  }
};
//Preview Uploaded Pictures
function previewBeforeUpload(id){
  let fileInput = document.querySelector("#"+id)
  document.querySelector("#"+id).addEventListener("change",function(){
    if(fileInput.files.length == 0){
      return;
    }
    let file = fileInput.files[0];
    let url = URL.createObjectURL(file);
    document.querySelector("#"+id+"-preview div").innerText = file.name;
    document.querySelector("#"+id+"-preview img").src = url;
    // removePicture
    document.querySelector("#"+id+"-removebtn").addEventListener("click", function(){
      document.querySelector("#"+id).value="";
      document.querySelector("#"+id+"-preview div").innerText = "日記封面";
      document.querySelector("#"+id+"-preview img").src = 'https://bit.ly/3ubuq5o';
    })
  });
}
//日記封面照
previewBeforeUpload("file-0");
previewBeforeUpload("file-1");
previewBeforeUpload("file-2");
previewBeforeUpload("file-3");
previewBeforeUpload("file-4");
previewBeforeUpload("file-5");
previewBeforeUpload("file-6");
previewBeforeUpload("file-7");
previewBeforeUpload("file-8");
