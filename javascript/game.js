var TSFC = 1e3;
var tickspeed = 1.0;
var ticks = 0;
var times1 = 250;
var times = times1;
const costs = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 10, 100, 1e3, 1e4, 1e6, 1e9, 1e12, 1e15],
    [0, 10, 100, 1e3, 1e4, 1e6, 1e9, 1e12, 1e15],
    [0, 10, 100, 1e3, 1e4, 1e6, 1e9, 1e12, 1e15],
    [0, 10, 100, 1e3, 1e4, 1e6, 1e9, 1e12, 1e15],
    [0, 1e7, 1e12, 1e18, 1e30, 1e45, 1e75, 1e155, 1e250],
    [0, 1e7, 1e12, 1e18, 1e30, 1e45, 1e75, 1e155, 1e250],
    [0, 1e7, 1e12, 1e18, 1e30, 1e45, 1e75, 1e155, 1e250],
    [0, 1e7, 1e12, 1e18, 1e30, 1e45, 1e75, 1e155, 1e250],
    // [0, 16, 256, 65536, 1e10, 1e25, 1e50, 1e100, 1.79e308],
    // [0, 1, 10, 1e3, 1e5, 1e7, 0, 0, 0]
];
const incs = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 100, 1e3, 1e4, 1e5, 1e6, 1e8, 1e10, 1e12],
    [0, 100, 1e3, 1e4, 1e5, 1e6, 1e8, 1e10, 1e12],
    [0, 100, 1e3, 1e4, 1e5, 1e6, 1e8, 1e10, 1e12],
    [0, 100, 1e3, 1e4, 1e5, 1e6, 1e8, 1e10, 1e12],
    [0, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8],
    [0, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8],
    [0, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8],
    [0, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8],
    // [0, 16, 256, 65536, 1e10, 1e25, 1e50, 1e100, 1.79e308],
    // [0, 1, 10, 1e3, 1e5, 1e7, 0, 0, 0]
]; //起价、涨比
//ADN 的乘数是 5/个，涨比乘数则是 10/个
var interval;
var buying = 0;
//购买的维度编号
// 1~8 AD 9~16 MD 17~24 PD 25~32 SD
// 33~40 IED 41~48 AntED 49~56 MED 57~64 PaED
// 65~72 ED 73~80 TD 81+ MetaD+
function change(tag, text) {
    document.getElementById(tag).innerHTML = text;
}

function shorten(x) {
    if (x < 1e3) return x;
    else if (x < 1e6) return Math.round(x / 1e3 * 100) / 100 + ' K';
    else if (x < 1e9) return Math.round(x / 1e6 * 100) / 100 + ' M';
    else if (x < 1e12) return Math.round(x / 1e9 * 100) / 100 + ' B';
    else if (x < 1e15) return Math.round(x / 1e12 * 100) / 100 + ' T';
    else if (x < 1e18) return Math.round(x / 1e15 * 100) / 100 + ' Qd';
    else if (x < 1e21) return Math.round(x / 1e18 * 100) / 100 + ' Qt';
    else if (x < 1e24) return Math.round(x / 1e21 * 100) / 100 + ' Sx';
    else if (x < 1e27) return Math.round(x / 1e24 * 100) / 100 + ' Sp';
    else if (x < 1e30) return Math.round(x / 1e27 * 100) / 100 + ' Oc';
    else if (x < 1e33) return Math.round(x / 1e30 * 100) / 100 + ' No';
    else if (x < 1e36) return Math.round(x / 1e33 * 100) / 100 + ' Dc';
    return x;
}

function shorten2(x) {
    if (x < 1e4) return x;
    else if (x < 1e8) return Math.round(x / 1e4 * 100) / 100 + ' W';
    else if (x < 1e12) return Math.round(x / 1e8 * 100) / 100 + ' E';
    else if (x < 1e16) return Math.round(x / 1e12 * 100) / 100 + ' Z';
    else if (x < 1e18) return Math.round(x / 1e15 * 100) / 100 + ' J';
    else if (x < 1e21) return Math.round(x / 1e18 * 100) / 100 + ' H';
    return x;
}

function shorten0(x) {
    return shorten2(Math.round(x * 100) / 100);
}
//万、亿、兆、京、垓
function tostring(x) {
    var res = parseInt(x);
    // while(x) {
    //     res+=
    //     x/=10;
    // }
    return res;
}
//ADN 维度规令 1：什么维度就生产什么，反之亦然。
//ADN 维度规令 2：维度提升的用处是解锁后面的维度。
//ADN 维度规令 3：所有 >= f1.8E308 的有限数都显示无限数。
class number {
    constructor(_type, _n, _num) {
            this.type = _type;
            this.num = _num;
            this.n = _n;
        }
        /*_type:
            S0 => 1
            S1 => 日常大数，[2, 1e6] //后者 = 10^6
            S2 => 指数，[1e6, 1F6] //后者 = 10^^6
            S3 => 多维指数，[1F6, 1J6] //e F G H I，后者 = 10{6}10
            S4 => 元指数（BEAF 临门一脚），[1J6, 1L3] //后者 = KKKKKKKKKK1 = KKKKKKKKK1e10  = 10{{{1}}}10 = {10, 10, 1, 3}
            S5 => BEAF 的初次登场，[1L3, {10, 10, {1, 2}, 2}]
            S6 => BEAF 大展拳脚，{10, 10, [{1, 2}, {1&2}], 2}
            -x = 表示 <1 数
            num 是列表
        */
    show() {
        switch (this.type) {
            case 0:
                return "1";
            case 1:
                return this.num[1];
            case 2:
                var res = "";
                for (let i = 1; i <= this.n; i++) {
                    res += this.num[i];
                    if (i < this.n) res += "e"; //指数+1
                }
                return res;
            default:
                return "NAn";
        }
    }
};
//玩游戏不带 adn
var lm = 1;
class Dimension {
    constructor(_name, _zhname, _point, _costs, _inc) {
        this.point = _point;
        // this.buttons = _buttons; 废掉了
        this.dims = [0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
        this.boughts = [0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
        this.muls = [0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0];
        this.incs = _inc;
        this.costs = _costs;
        this.name = _name;
        this.zhname = _zhname;
        this.db = 0;
        this.tscost = TSFC;
        this.tseff = 1.0;
        this.tickbought = 0;
    }
    updatePoint() {
        let element = document.getElementById(this.name + "-Amount");
        element.innerHTML = '你有 ' + shorten0(this.point) + ' ' + this.zhname + '。';
    }
    updatePointPerSec() {
        let element = document.getElementById(this.name + "-PerSec")
        element.innerHTML = '你现在正在以 ' + shorten0(this.dims[1] * this.muls[1]) + ' ' + this.zhname + '/游戏秒的速度获得' + this.zhname + '。';
    }
    mul(x) {
        let cheng = 1;
        cheng *= 2 ** Math.round(this.boughts[x] / 5);
        if ((this.db + 1 - (x + 1) / 2) > 0) cheng *= 2 ** (this.db + 1 - (x + 1) / 2);
        return cheng;
    }
    updatemuls() {
        for (let i = 1; i <= 8; i++) this.muls[i] = this.mul(i);
        this.muls[1] *= this.tseff;
    }
    flag(x) {
        if (x > 8) return "NAIVE";
        return this.name + "-" + tostring(x);
        // flagbuy(x) {
        //     return this.flag(x) + "b";
        // }
    }
    nam() {
        return this.name + "-";
    }
    flagshow(x) {
        return this.flag(x) + "s";
    }
    flagcost(x) {
        return this.flag(x) + "c";
    }
    flagDB() {
        return this.nam() + "DB";
    }
    flagbuy() {
        return this.nam() + "buy";
    }
    flagtick() {
        return this.nam() + "tick";
    }
    updateDimension(i) {
        change(this.flagshow(i), '当前你拥有' + shorten0(this.dims[i]) + ' 个 ' + ' （实际上购买了 ' + shorten0(this.boughts[i]) + ' 个），乘数：' + shorten0(this.muls[i]));
    }
    updateDimensions() {
        for (let i = 1; i <= 8; i++) {
            this.updateDimension(i);
        }
    }
    buytickspeed() {
        if (this.point >= this.tscost) {
            this.point -= this.tscost;
            this.tscost *= 2;
            this.tseff *= 1.1;
            this.ticks++;
            change(this.flagtick() + "Speed", '当前倍率：' + shorten2(this.tseff) + '倍（实际购买数：' + shorten2(this.tickbought) + '）');
            change(this.flagtick() + "SpeedAmount", '花费: ' + shorten2(this.tscost));
            this.updatePoint();
        }
    }
    updateInter() {
        for (let i = 1; i < 8; i++) {
            this.dims[i] += this.dims[i + 1] * this.muls[i + 1] * (1.0 / times); // * tick;
        }
        // document.getElementById().style.visibility = "visible";
        this.updateDimensions();
    }
    updateCosts() {
        for (let i = 1; i <= 8; i++) {
            change(this.flagcost(i), '花费：' + shorten0(this.costs[i]));
        }
    }
    buy(x) {
        //购买第 x 维度
        let ly = lm; //玩梗，林愔是林明的妹妹
        while ((this.point >= this.costs[x]) && ly) {
            if (x < 4) document.getElementById(this.flag(x + 1)).style.visibility = "visible";
            // if (x >= 4) document.getElementById(this.flagDB).style.visibility = "visible";
            this.point -= this.costs[x];
            this.boughts[x]++;
            this.dims[x]++;
            if (this.boughts[x] % 5 == 0) this.muls[x] *= 2;
            if (this.boughts[x] % 10 == 0) this.costs[x] *= this.incs[x];
            this.updatePointPerSec();
            var element = document.getElementById(this.flagcost(x));
            element.innerHTML = '花费： ' + shorten2(this.costs[x]);
            this.updatePoint();
            this.updateDimensions();
            ly--;
        }
    }
    gamemain() {
        this.point += this.dims[1] * this.muls[1] * (1.0 / times);
        if (this.point >= 1000) document.getElementById(this.flagtick()).style.visibility = "visible";
        this.updatePoint();
        this.updatePointPerSec();
        this.updatemuls();
        this.updateInter();
        this.updateDimensions();
    }
    init() {
        document.getElementById(AD.flagtick() + "Speed").onclick = AD.buytickspeed();
        document.getElementById(AD.flagcost(1)).onclick = AD.buy.bind(AD, 1);
        document.getElementById(AD.flagcost(2)).onclick = AD.buy.bind(AD, 2);
        document.getElementById(AD.flagcost(3)).onclick = AD.buy.bind(AD, 3);
        document.getElementById(AD.flagcost(4)).onclick = AD.buy.bind(AD, 4);
        document.getElementById(AD.flagcost(5)).onclick = AD.buy.bind(AD, 5);
        document.getElementById(AD.flagcost(6)).onclick = AD.buy.bind(AD, 6);
        document.getElementById(AD.flagcost(7)).onclick = AD.buy.bind(AD, 7);
        document.getElementById(AD.flagcost(8)).onclick = AD.buy.bind(AD, 8);
    }
    hardreset() {
        this.dims = [0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
        this.boughts = [0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
        this.muls = [0, 1.0, 1, 1, 1, 1, 1, 1, 1];
        this.costs = costs[1];
        this.tickbought = 0;
        this.tscost = TSFC;
        this.point = 10;
    }
};

var AD = new Dimension("AM", "反物质", 10, [0, 10, 100, 1e3, 1e4, 1e6, 1e9, 1e12, 1e15], [0, 100, 1e3, 1e4, 1e5, 1e6, 1e8, 1e10, 1e12]);

AD.init();

setInterval(function() {
    AD.gamemain();
}, 1000.0 / times1);

AD.updateCosts();
AD.updateInter();
AD.updateDimensions();
document.getElementById("AM-DB").onclick = function() {
    AD.hardreset();
    for (let i = 0; i < 5; i++)
        if (AD.db == i && AD.boughts[i + 4] < 20) return;
    if (AD.db > 4 && AD.boughts[8] < AD.db * 10 - 20) return;
    reset_tier1();
    AD.db++;
    var tmp1 = AD.db;
    if (tmp1 > 4) tmp1 = 4;
    for (let i = 1; i <= 4; i++) {
        if (AD.db >= i) document.getElementById(AD.flag(i + 4)).style.visibility = "visible";
    }
    switch (AD.db) {
        case 0:
            document.getElementById("AM-DB").innerHTML = "进行维度提升，重置以前的维度。\n第 1 次维度提升时，将解锁第 5 维度，\n并给予第 1~2 维度以 2 倍的加成。\n需要：20 第 4 反物质维度。"
            break;
        case 1:
            document.getElementById("AM-DB").innerHTML = "进行维度提升，重置以前的维度。\n第 2 次维度提升时，将解锁第 6 维度，\n并再次给予第 1~4 维度以 2 倍的加成。\n需要：20 第 5 反物质维度。"
            break;
        case 2:
            document.getElementById("AM-DB").innerHTML = "进行维度提升，重置以前的维度。\n第 3 次维度提升时，将解锁第 7 维度，\n并再次给予第 1~6 维度以 2 倍的加成。\n需要：20 第 6 反物质维度。"
            break;
        case 3:
            document.getElementById("AM-DB").innerHTML = "进行维度提升，重置以前的维度。\n第 4 次维度提升时，将解锁第 8 维度，\n并再次给予第 1~8 维度以 2 倍的加成。\n需要：20 第 7 反物质维度。"
            break;
        case 4:
            document.getElementById("AM-DB").innerHTML = "进行维度提升，重置以前的维度。\n第 5 次维度提升时，将解锁维度献祭，\n并再次给予第 1~8 维度以 2 倍的加成。\n需要：20 第 8 反物质维度。"
            break;
        case 5:
            document.getElementById("AM-DB").innerHTML = "进行维度提升，重置以前的维度。\n第 6 次维度提升时，将解锁自动维度购买和最大化维度购买，\n并再次给予第 1~8 维度以 2 倍的加成。\n需要：30 第 8 反物质维度。"
            break;
        case 6:
            document.getElementById("AM-DB").innerHTML = "进行维度提升，重置以前的维度。\n第 7 次维度提升时，将解锁反物质性能、反物质加速器和反物质星系，\n并再次给予第 1~8 维度以 2 倍的加成。\n需要：40 第 8 反物质维度。"
            break;
        default:
            document.getElementById("AM-DB").innerHTML = "进行维度提升，重置以前的维度。\n第" + AD.db + 1 + "次维度提升时，将再次给予第 1~8 维度以 2 倍的加成。\n需要：" + AD.db * 10 - 20 + "第 8 反物质维度。"
            break;
    }
}