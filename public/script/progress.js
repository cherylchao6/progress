// Get API query parameter
let token = localStorage.getItem("token");
const urlParams = new URLSearchParams(window.location.search);
const progressId = urlParams.get("progressid");
let data;
renderSelectTimeData();
console.log(data);

//get progress time data
async function getProgressTimeData () {
  return await fetch(`/api/1.0/progressTime?progressid=${progressId}`,{
    method: "GET",
    headers: { 'authorization': `Bearer ${token}` },
  }).then(response => {
    if (response.status === 200 ) {
      return response.json();
    } else if (response.status === 401) {
      alert('請先登入');
      return window.location.assign('/signin');
      } else if (response.status === 403) {
        alert('無權限操做此網頁');
        return window.location.assign('/signin');
      }
    })
    .then (data => {
      if (data) {
        return data;
      } 
    });
};

async function renderSelectTimeData () {
  data = await getProgressTimeData ();
  // console.log(data);
  function node(name, child){
    this.name=name;
    this.child=child;
  }

  function dataHierarchy() {
    //年
    // console.log(Object.keys(data)) = ["2020","2021"]
    let year = [];
    var output=new Array();
    for (let k in Object.keys(data)) {
      year[k] = new Array();
      var i=0;
      // console.log(data[Object.keys(data)[k]]) = [{月:[日]},{月:[日]}......];
      for (let j in data[Object.keys(data)[k]]) {
        let monthDayObject = data[Object.keys(data)[k]][j];
        let month = Object.keys(monthDayObject)[0];
        let dayArray = monthDayObject[month];
        year[k][i++]=new node(month, dayArray);
      }
          // 年
      var i=0;
      output[i++]=new node(Object.keys(data)[k], Object.keys(data)[k]);
    }
    return(output);
  }
  dataTree=dataHierarchy();
  
  // 第二個欄位被更動後的反應動作
  function onChangeColumn2(){
    form=document.theForm;
    index1=form.column1.selectedIndex;
    index2=form.column2.selectedIndex;
    index3=form.column3.selectedIndex;
    // Create options for column 3
    for (i=0;i<dataTree[index1].child[index2].child.length;i++)
      form.column3.options[i]=new Option(dataTree[index1].child[index2].child[i], dataTree[index1].child[index2].child[i]);
    form.column3.options.length=dataTree[index1].child[index2].child.length;
  }
  
  // 第一個欄位被更動後的反應動作
  function onChangeColumn1() {
    form=document.theForm;
    index1=form.column1.selectedIndex;
    index2=form.column2.selectedIndex;
    index3=form.column3.selectedIndex;
    // Create options for column 2
    for (i=0;i<dataTree[index1].child.length;i++)
      form.column2.options[i]=new Option(dataTree[index1].child[i].name, dataTree[index1].child[i].name);
    form.column2.options.length=dataTree[index1].child.length;
    // Clear column 3
    form.column3.options.length=0;
  }
};

console.log(data);




