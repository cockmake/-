<template>
  <div class="a">
    <el-switch
        v-model="switch_status"
        active-text="5个"
        class="ml-2 d-switch"
        inactive-text="1个"
        inline-prompt
        size="large"
        style="--el-switch-on-color: #0bf201; --el-switch-off-color: #ed8303"
    />
    <el-text class="e">
      中奖号码
    </el-text>
    <el-button class="d" type="warning" @click="removeResultTail">
      回退一轮
    </el-button>
    <div class="b">
      <div class="grid-container">
        <div v-for="row in 5" :key="row" class="grid-row">
          <div v-for="col in 5" :key="col" class="grid-cell" :ref="setSlotMachineCellRef">
            <div :ref="setSlotMachineRef" class="slot-machine">
              <ul :style="{ transform: `translateY(${positions[(row - 1) * 5 + (col - 1)]}px)` }" class="options">
                <li v-for="(option, index) in options" :key="index" style="cursor: pointer; text-align: center; font-size: 2vw; font-weight: bold;"
                    @click="startSlotMachine"
                >{{ option }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="c">
      <div class="c-5">
        <div v-for="(row, rowIndex) in result_5" :key="'row-' + rowIndex" class="result-5-row">
          <transition v-for="(number, numberIndex) in row" :key="'number-' + rowIndex + '-' + numberIndex"
                      name="el-zoom-in-center">
            <div v-show="show" class="c-circle-5">
              {{ number }}
            </div>
          </transition>

        </div>
      </div>

      <div class="c-1">
        <transition v-for="(number, index) in result_1" :key="'c1-' + index"
                    name="el-zoom-in-center">
          <div v-show="show" class="c-circle-1">
            {{ number }}
          </div>
        </transition>
      </div>


    </div>
  </div>
</template>
<script setup>
import {ref, watch} from 'vue';

const result_5 = ref([

]);
const result_1 = ref([

])
const show = ref(true)

const switch_status = ref(true)

const options = ref([
]);
for (let i = 0; i <= 75; i++) {
  options.value.push(i);
}

const positions = ref([]);
for (let i = 0; i < 25; i++) {
  positions.value.push(0);
}
function resetPositions() {
  // 设置可见
  for (let i = 0; i < slotMachineCellRefs.value.length; i++) {
    slotMachineCellRefs.value[i].style.visibility = 'visible';
  }

  // 归零
  for (let i = 0; i < 25; i++) {
    positions.value[i] = 0;
  }


}
function removeResultTail() {
  if(opStack.length === 0){
    return
  }
  let end_flag = opStack.pop()
  if (end_flag) {
    result_5.value.pop();
  } else {
    result_1.value.pop();
  }
}
const spinnings = ref([])
for (let i = 0; i < 25; i++) {
  spinnings.value.push(false);
}
let canRender = true;
// 记录操作顺序
let opStack = []
function renderFromRowCol() {
  if(result_5_flag){
    result_5.value.push(turn_selected_result);
    opStack.push(true)
  }else{
    result_1.value.push(turn_selected_result);
    opStack.push(false)
  }
  show.value = !show.value
  // 0.3s后渲染
  setTimeout(() => {
    show.value = !show.value
  }, 300);


  let turn_select_index = []
  for (let i = 0; i < turn_selected_row_col.length; i++) {
    turn_select_index.push(turn_selected_row_col[i][0] * 5 + turn_selected_row_col[i][1]);
  }
  // 其他方块不可见
  for (let i = 0; i < slotMachineCellRefs.value.length; i++) {
    if (!turn_select_index.includes(i)) {
      slotMachineCellRefs.value[i].style.visibility = 'hidden';
    }
  }

  // 将选中的方块背景变为红色
  for (let i = 0; i < turn_selected_row_col.length; i++) {
    slotMachineCellRefs.value[turn_selected_row_col[i][0] * 5 + turn_selected_row_col[i][1]].style.backgroundColor = 'red';
  }









}
watch(() => spinnings.value[24], (value, oldValue, onCleanup) => {
  canRender = !value;
  // 如果可以渲染
  // 暂停0.7s后渲染
  if (canRender) {
    setTimeout(() => {
      renderFromRowCol();
    }, 700);
  }
})
function checkSpinning() {
  // 检查是否有slot-machine正在抽奖
  for (let i = 0; i < spinnings.value.length; i++) {
    if (spinnings.value[i]) {
      return true;
    }
  }
  return false;
}

const duration = 1000; // 抽奖持续时间
const itemHeight = 60;

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    // 随机选择一个比当前元素索引小的元素
    const j = Math.floor(Math.random() * (i + 1));
    // 交换它们的位置
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
let turn_selected_row_col = []
let turn_selected_result = null
let result_5_flag = false
const easeOut = (t) => t * (2 - t);

function startSlotMachine() {
  if (!checkSpinning()) {
    resetPositions();
    turn_selected_row_col = []
    turn_selected_result = null
    result_5_flag = false
    //slotMachineCellRefs的背景色全部变为透明
    for (let i = 0; i < slotMachineCellRefs.value.length; i++) {
      slotMachineCellRefs.value[i].style.backgroundColor = 'transparent';
    }
    // 对这5*5个slot-machine进行抽奖
    // 获取新的数字先剔除result中已经获得的数
    // had_random使用哈希集合 提高查询效率
    let had_random = new Set();
    for (let i = 0; i < result_5.value.length; i++) {
      for (let j = 0; j < result_5.value[i].length; j++) {
        had_random.add(result_5.value[i][j]);
      }
    }
    for (let i = 0; i < result_1.value.length; i++) {
      had_random.add(result_1.value[i]);
    }
    // 1-75进行随机，不包含已经获得的数
    let random = [];
    for (let i = 1; i <= 75; i++) {
      if (!had_random.has(i)) {
        random.push(i);
      }
    }
    random = shuffleArray(random);
    // 取前25个数
    random = random.slice(0, 25);

    // 5*5个slot-machine进行抽奖
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        const last_position = positions.value[i * 5 + j];
        spinnings.value[i * 5 + j] = true;
        const targetIndex = random[i * 5 + j];
        const currentIndex = Math.floor(-positions.value[i * 5 + j] / itemHeight);
        const distanceToTravel = itemHeight * (targetIndex - currentIndex) // 滚动距离
        let currentTime = 0;
        const animate = () => {
          currentTime += 10; // 动画每帧持续时间
          positions.value[i * 5 + j] = last_position - easeOut(currentTime / duration) * distanceToTravel;
          if (currentTime < duration) {
            requestAnimationFrame(animate);
          } else {
            positions.value[i * 5 + j] = -targetIndex * itemHeight;
            spinnings.value[i * 5 + j] = false;
          }
        };
        requestAnimationFrame(animate);
      }
    }

    if(switch_status.value){
      result_5_flag = true
      // 随机选出0-24中5个就可以
      // 在random中随机取出5个并记录所在的行列
      let a = []
      for (let i = 0; i < 25; i++){
        a.push(i)
      }
      a = shuffleArray(a)
      a = a.slice(0, 5)
      turn_selected_result = []
      for (let i = 0; i < 5; i++){
        let select_row = Math.floor(a[i] / 5);
        let select_col = a[i] % 5;
        turn_selected_result.push(random[a[i]]);
        turn_selected_row_col.push([select_row, select_col]);
      }
      // 以下是对角线的方式
      // 5*5的矩阵随机选择后一行或某一列或对角线
      // 将所在的slot-machine的背景变为红色
      //   let select_index = Math.floor(Math.random() * 3);
      //   if (select_index === 0) {
      //     // 选出一行
      //     let select_row = Math.floor(Math.random() * 5);
      //     turn_selected_result = random.slice(select_row * 5, select_row * 5 + 5);
      //     for (let i = 0; i < 5; i++) {
      //       turn_selected_row_col.push([select_row, i]);
      //     }
      //   } else if (select_index === 1) {
      //     // 选出一列
      //     let select_col = Math.floor(Math.random() * 5);
      //     turn_selected_result = [];
      //     for (let i = 0; i < 5; i++) {
      //       turn_selected_result.push(random[i * 5 + select_col]);
      //       turn_selected_row_col.push([i, select_col]);
      //     }
      //   } else {
      //     // 选出对角线
      //     let select_diagonal = Math.floor(Math.random() * 2);
      //     turn_selected_result = [];
      //     if (select_diagonal === 0) {
      //       for (let i = 0; i < 5; i++) {
      //         turn_selected_result.push(random[i * 5 + i]);
      //         turn_selected_row_col.push([i, i]);
      //       }
      //     } else {
      //       for (let i = 0; i < 5; i++) {
      //         turn_selected_result.push(random[i * 5 + 4 - i]);
      //         turn_selected_row_col.push([i, 4 - i]);
      //       }
      //     }
      //   }
      //
    }
    else{
      // 选出1个
      // 这个只需要0-24选取一个
      let select_index = Math.floor(Math.random() * random.length);
      let select_row = Math.floor(select_index / 5);
      let select_col = select_index % 5;
      turn_selected_result = random[select_index];
      turn_selected_row_col.push([select_row, select_col]);
    }
  }
}

const slotMachineRefs = ref([]);
const slotMachineCellRefs = ref([]);
const setSlotMachineRef = el => {
  if (el) {
    slotMachineRefs.value.push(el);
  }
};
const setSlotMachineCellRef = el => {
  if (el) {
    slotMachineCellRefs.value.push(el);
  }
};


</script>
<style scoped>
.a {
  background-image: url("/bg.png");
  width: 100%;
  height: 100%;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
}

.d-switch {
  position: absolute;
  top: 14.6%;
  left: 4%;
  z-index: 1;
}

.b {
  position: absolute;
  top: 19%;
  left: 4%;
  width: 48%;
  height: 63%;
}

.c {
  position: absolute;
  top: 19%;
  left: 53%;
  height: 51%;
  width: 46%;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.c-5 {
  width: 100%;
  flex: 3;
  display: flex;
  flex-direction: column; /* To layout rows vertically */
  justify-content: space-around;
  align-items: center;
}
.c-1 {
  width: 100%;
  flex: 1;
  display: flex;
  justify-content: space-around;
  align-items: center;
}
.c-circle-5 {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 6vw;
  height: 6vw;
  border-radius: 50%;
  color: black;
  background-color: #FBE000;
  font-size: 4vw;
  margin: 5px;
}
.c-circle-1 {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 6vw;
  height: 6vw;
  border-radius: 50%;
  color: white;
  background-color: #EC8403;
  font-size: 4vw;
  margin: 5px;
}
.result-5-row {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}

.slot-machine {
  height: 60px;
  overflow: hidden;
}

.options {
  list-style: none;
  padding: 0;
  margin: 0;
  transition: transform 1s ease-out;
}

.grid-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}

.grid-row {
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.grid-cell {
  display: flex;
  height: 100%;
  width: 100%;
  justify-content: center;
  align-items: center;
  border: 2px solid #347eba;
  border-radius: 5%;

}

.options li {
  height: 60px;
  line-height: 60px;
}
.d{
  position: absolute;
  top: 14.6%;
  left: 53%;
  z-index: 1;
}
.e{
  position: absolute;
  top: 6%;
  left: 70%;
  z-index: 1;

  font-size: 3vw;
  font-weight: bold;
  color: black;
}
</style>
