// 获取DOM元素
const canvas = document.getElementById('chess');
const ctx = canvas.getContext('2d');
const statusInfo = document.getElementById('statusInfo');

// 游戏配置
const GRID_SIZE = 15; // 15x15的棋盘
const CELL_SIZE = 30; // 每个格子的像素大小
const PADDING = 15;   // 棋盘边缘留白

// 游戏状态变量
let isBlackTurn = true; // true代表黑棋，false代表白棋
let gameOver = false;
let chessBoard = []; // 二维数组存储棋盘状态 (0:空, 1:黑, 2:白)

// 初始化游戏
function init() {
    // 初始化棋盘数组
    for (let i = 0; i < GRID_SIZE; i++) {
        chessBoard[i] = [];
        for (let j = 0; j < GRID_SIZE; j++) {
            chessBoard[i][j] = 0;
        }
    }
    
    // 重置状态
    isBlackTurn = true;
    gameOver = false;
    updateStatus();
    
    // 绘制棋盘
    drawBoard();
}

// 绘制棋盘网格
function drawBoard() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#5a3d1c";
    ctx.lineWidth = 1;

    for (let i = 0; i < GRID_SIZE; i++) {
        // 画横线
        ctx.beginPath();
        ctx.moveTo(PADDING, PADDING + i * CELL_SIZE);
        ctx.lineTo(canvas.width - PADDING, PADDING + i * CELL_SIZE);
        ctx.stroke();

        // 画竖线
        ctx.beginPath();
        ctx.moveTo(PADDING + i * CELL_SIZE, PADDING);
        ctx.lineTo(PADDING + i * CELL_SIZE, canvas.height - PADDING);
        ctx.stroke();
    }
}

// 绘制棋子
// i, j: 网格坐标索引
// isBlack: 是否是黑棋
function drawPiece(i, j, isBlack) {
    ctx.beginPath();
    // 计算圆心坐标
    const x = PADDING + i * CELL_SIZE;
    const y = PADDING + j * CELL_SIZE;
    
    ctx.arc(x, y, 13, 0, 2 * Math.PI); // 半径13
    
    // 创建渐变效果让棋子更有立体感
    const gradient = ctx.createRadialGradient(x + 2, y - 2, 13, x + 2, y - 2, 0);
    
    if (isBlack) {
        gradient.addColorStop(0, "#0a0a0a");
        gradient.addColorStop(1, "#636766");
    } else {
        gradient.addColorStop(0, "#d1d1d1");
        gradient.addColorStop(1, "#f9f9f9");
    }
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // 记住这步棋
    chessBoard[i][j] = isBlack ? 1 : 2;
}

// 更新UI状态文字
function updateStatus() {
    if (gameOver) {
        const winner = isBlackTurn ? "黑棋" : "白棋";
        const colorClass = isBlackTurn ? "black" : "white";
        statusInfo.innerHTML = `游戏结束! <span class="${colorClass}">${winner}获胜</span>`;
    } else {
        const current = isBlackTurn ? "黑棋" : "白棋";
        const colorClass = isBlackTurn ? "black" : "white";
        statusInfo.innerHTML = `当前回合: <span class="${colorClass}">${current}</span>`;
    }
}

// 点击事件处理
canvas.onclick = function(e) {
    if (gameOver) return;

    // 获取点击相对于canvas的坐标
    const x = e.offsetX;
    const y = e.offsetY;

    // 转换为网格索引
    const i = Math.floor(x / CELL_SIZE);
    const j = Math.floor(y / CELL_SIZE);

    // 简单的防止误触边缘逻辑（可选，这里为了简化直接判定范围）
    if (i < 0 || i >= GRID_SIZE || j < 0 || j >= GRID_SIZE) return;

    // 如果该位置没有棋子
    if (chessBoard[i][j] === 0) {
        // 落子
        drawPiece(i, j, isBlackTurn);
        
        // 检查是否获胜
        if (checkWin(i, j)) {
            gameOver = true;
            updateStatus();
            // 稍微延迟弹出提示，让棋子先画出来
            setTimeout(() => {
                alert((isBlackTurn ? "黑棋" : "白棋") + " 赢了！");
            }, 10);
        } else {
            // 切换回合
            isBlackTurn = !isBlackTurn;
            updateStatus();
        }
    }
};

// 核心算法：检查是否获胜
function checkWin(x, y) {
    const color = chessBoard[x][y];
    
    // 四个方向：水平，垂直，主对角线，副对角线
    const directions = [
        [[1, 0], [-1, 0]],  // 水平
        [[0, 1], [0, -1]],  // 垂直
        [[1, 1], [-1, -1]], // 主对角线 (\)
        [[1, -1], [-1, 1]]  // 副对角线 (/)
    ];

    for (const dir of directions) {
        let count = 1; // 包含当前落子

        // 向两个相反方向延伸检查
        for (const delta of dir) {
            let i = x + delta[0];
            let j = y + delta[1];

            while (
                i >= 0 && i < GRID_SIZE && 
                j >= 0 && j < GRID_SIZE && 
                chessBoard[i][j] === color
            ) {
                count++;
                i += delta[0];
                j += delta[1];
            }
        }

        if (count >= 5) return true;
    }

    return false;
}

// 重玩功能（暴露给HTML按钮调用）
function restartGame() {
    init();
}

// 页面加载完成后启动
init();