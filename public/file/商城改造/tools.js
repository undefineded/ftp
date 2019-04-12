import api from "./api";
import {it} from "./form";
import {Toast} from "mint-ui";
import store from "../store";

const myToast = function (msg) {
  Toast({
    message: msg,
    duration: 1000,
  })
};

const compaireFormData = function (obj1, obj2) {
  if (!obj1 || !obj2) {
    return true
  }
  for (let prop in obj1) {
    if (obj1.hasOwnProperty(prop)) {
      if (typeof obj1[prop] !== 'undefined' && typeof obj2[prop] !== 'undefined') {
        // 此处不采用严格相等
        if (obj1[prop] != obj2[prop]) {
          // console.log(prop, obj1[prop], obj2[prop]);
          return true
        }
      }
    }
  }
}

const formatFormData = function (form, formServer, _this) {
  const tags = formServer.fangxingConfig.tags || [];
  const roomConf = formServer.fangxingConfig.roomConf || [];
  if (_this.rawData.huxingData) {
    form.id = _this.rawData.huxingData.id;
    form.version = _this.rawData.huxingData.version;
  }
  form.couponTypeId = formServer.coupon.couponTypeId || '';
  form.huxingTags = tags.map(item => {
    return item.value
  }).join(',');
  roomConf.forEach(item => {
    form[item.value] = 1;
  });
  form.huxingCoverImg = formServer.huxingCoverImgs.join(',');
  form.huxingBroadcastImgs = formServer.huxingBroadcastImgs.join(',');
  form.isElevator = form.isElevator ? 1 : 0;
  form.currentUserId = api.getUserId();
  return form;
};

const EMPTY_PROMPT = {
  'huxingName': '请输入户型名称',
  'houseSize': '请输入房间面积',
  'liveRoomNum': '请选择户型',
  'orientation': '请选择朝向',
  'markAmount': '请输入租金',
  'huxingTags': '请选择户型标签',
  // 'managerName': '请输入房管姓名',
  // 'managerPhone': '请输入房管电话',
  'houseNum': '请输入房间数量'
}

const LIMIT_PROMPT = {
  'huxingName': '户型名称不得超过10个字符',
  'managerName': '房管姓名不得超过10个字符',
  'managerPhone': '电话不得超过15个字符',
}

const LIMIT_CONFIG = {
  houseSize: 9999,
  markAmount: 999999,
  houseNum: 9999
}

const formValidate = function (form, ig, type) {
  // if (type === 'dis' && it(form.huxingAddress).isEmpty()) {
  //   myToast('请选择地址');
  //   return false;
  // }
  if (type === 'dis' && form.floorTotal < 0) {
    myToast('请选择楼层');
    return false
  }
  if (type === 'dis' && form.rentType < 0) {
    myToast('请选择出租类型');
    return false
  }
  // 非空验证
  const emptyCheck = Object.keys(EMPTY_PROMPT);
  for (let i = 0; i < emptyCheck.length; i++) {
    const key = emptyCheck[i];
    if (it(form[key]).isEmpty()) {
      myToast(EMPTY_PROMPT[key]);
      return false
    }
  }
  // 非负验证
  if (form.houseSize < 0) {
    myToast('房间面积不能小于0');
    return false
  }
  ;
  if (form.markAmount < 0) {
    myToast('租金不能小于0');
    return false
  }
  ;
  if (form.houseNum < 0) {
    myToast('房间数量不能小于0');
    return false
  }
  ;
  // 超限验证
  if (form.houseSize > LIMIT_CONFIG.houseSize) {
    myToast('房间面积超限');
    return false
  }
  if (form.houseNum > LIMIT_CONFIG.houseNum) {
    myToast('房间数量超限');
    return false
  }
  if (form.markAmount > LIMIT_CONFIG.markAmount) {
    myToast('房间租金超限');
    return false
  }
  const formServer = store.state.form;
  if (formServer.huxingCoverImgs.length < 1) {
    myToast('请上传封面图');
    return false;
  }
  if (formServer.huxingBroadcastImgs.length < 1) {
    myToast('请上传轮播图');
    return false;
  }
  if (!formServer.fangxingConfig.tags) {
    myToast('请选择户型标签');
    return false;
  }
  if (!formServer.fangxingConfig.roomConf) {
    myToast('请选择户型配置');
    return false;
  }
  if (!it(form.huxingName).limit([1, 10])) {
    myToast('户型名称不能超过10个字符');
    return false;
  }
  // if (!it(form.managerName).limit([1, 10])) {
  //   myToast('房管姓名不能超过10个字符');
  //   return false;
  // }
  // if (!it(form.managerPhone).is('phone')) {
  //   myToast('房管电话格式不正确');
  //   return false;
  // }
  return true;
}

const numRule = function (val, rule) {
  if (val < 0) {
    return 0
  }
  val = val.toString().replace(/[^\d^\.？]+/g, '')
  // console.log(val)
  let numValue = val.toString()
  if (numValue === '') {
    Toast('只能输入数字')
    return
  }
  let first = rule[0]
  let before = rule[1]
  let thisCount = 0;
  numValue.replace(/[.]/g, function (m, i) {
    thisCount++;
  });
  if (thisCount > 1) {
    console.log(thisCount)
    numValue = numValue.substring(0, numValue.length - 1)
  }
  if (thisCount > 0) {
    let valArr = numValue.split('.')
    let firstNum = valArr[0]
    let beforeNum = valArr[1]
    if (firstNum.substring(0, 1) === '0') {
      if (firstNum.substring(1, 2) === '0') {
        return firstNum.substring(0, 1) + '.' + beforeNum
      }
    }
    if (valArr[0].length > first) {
      firstNum = valArr[0].substring(0, first)
    }
    if (valArr[1].length > before) {
      beforeNum = valArr[1].substring(0, before)
    }
    if (firstNum === '0') {
      let nc = true
      let beforeNumArr = beforeNum.split('')
      for (let i = 0; i < beforeNumArr.length - 1; i++) {
        console.log(beforeNumArr[i])
        if (beforeNumArr[i] !== '0') {
          nc = false
        }
      }
      if (nc) {
        beforeNum = beforeNum.substring(0, beforeNum.length - 1) + '1'
      }
    }
    return firstNum + '.' + beforeNum
  }
  if (thisCount === 0) {
    if (numValue.substring(0, 1) === '0') {
      if (numValue.length > 1) {
        return numValue.substring(1, 2)
      }
    }
    if (numValue.length > first) {
      numValue = numValue.substring(0, first)
    }
  }
  return numValue
}

const calcRestDayTime = function (dateText, time) {
  // console.log(dateText, time);
  // dateText.replace(/[-]/g,'/')
  const targetTime = new Date(dateText.replace(/[-]/g, '/')).getTime();
  const edgeTime = targetTime + time;
  const nowTime = Date.now();

  let distance = edgeTime - nowTime;
  if (distance < 0) {
    return {day: 0, hour: 1};
  }
  let day = Math.floor(distance / 86400000);
  distance = distance % 86400000;
  let hour = Math.ceil(distance / 3600000);
  if (hour > 23) {
    hour = 0;
    day++;
  }
  return {
    day,
    hour
  }
}

export {
  compaireFormData,
  formatFormData,
  formValidate,
  numRule,
  calcRestDayTime
}