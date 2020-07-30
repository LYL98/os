/* eslint-disable */
export default {
  read: (file) => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader(); //读取操作就是由它完成.
        reader.readAsBinaryString(file);//读取文件的内容,也可以读取文件的URL
        reader.onload = (evt) => {
          //当读取完成后回调这个函数,然后此时文件的内容存储到了result中,直接操作即可
          const data = evt.target.result;
          const workbook = XLSX.read(data, {type: 'binary'}); // 以二进制流方式读取得到整份excel表格对象
          let buildings = []; // 存储获取到的数据
          let fromTo = '';
          // 遍历每张表读取
          for (var sheet in workbook.Sheets) {
            if (workbook.Sheets.hasOwnProperty(sheet)) {
              fromTo = workbook.Sheets[sheet]['!ref'];
              buildings = buildings.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]));
              // break; // 如果只取第一张sheet表，就取消注释这行
            }
          }
          resolve({ code: 0, data: buildings });
        };
      } catch (e) {
        reject(e);
      }
    });
  }
}
