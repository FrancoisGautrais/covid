
var Const = {
    API_PREFIX : "/api/v1",
    api : function(x){ return Const.API_PREFIX+"/"+x }
}

var TABS = {};
var SIDENAV = null;


function removearray(arr, x)
{
    var out = []
    for(var i=0; i<arr.length; i++)
        if(arr[i]!=x)
            out.push(arr[i])
    return out
}


/*
function clearTextSelection()
{
    var sel = window.getSelection ? window.getSelection() : document.selection;
    if (sel) {
        if (sel.removeAllRanges) {
            sel.removeAllRanges();
        } else if (sel.empty) {
            sel.empty();
        }
    }
}
*/

function $elem(str, obj)
{
    return $(format_string(str, obj))
}

function isFloat(n){
    return Number(n) === n && n % 1 !== 0;
}


function floatstr(x)
{
    return Math.round(x*100)/100
}

function format_string(str, obj)
{
    var out=""
    var nexti = str.indexOf("$")
    while(nexti>=0)
    {
        out+=str.substr(0,nexti)
        var endi = str.indexOf("}")
        var name=str.substr(nexti+2,endi-nexti-2)
        str=str.substr(endi+1)
        if(isFloat(obj[name]))
        {
            out+=floatstr(obj[name])
        }else{
            out+=obj[name]
        }

        nexti=str.indexOf("$")
    }
    return out+str
}


function date_to_int(x)
{
    var arrstr = x.split("/"), arr=[]
    for(var i=0; i<arrstr.length; i++)
        arr.push(parseInt(arrstr[i]))
    var date = new Date(arr[2], arr[1]-1, arr[0], 0,0,0)
    return Math.floor(date.getTime()/1000)
}


function datearr_to_int(arr)
{
    var date = new Date(arr[0], arr[1]-1, arr[2], 0,0,0)
    return Math.floor(date.getTime()/1000)
}


function datearr_to_str(x)
{
    var a=x[2], m=x[1], j=x[0]
    if(m<10) m="0"+m
    if(j<10) j="0"+j
    return j+"/"+m+"/"+a
}


function dateargs(y, m=1, j=1){
    m--
    var x = (new Date(y,m,j)).getTime()/1000
    return x
}

function int_to_date(timestamp)
{
    var date = new Date(timestamp * 1000)
    var y, m, d
    y=(date.getFullYear())+""
    m=(date.getMonth()+1)+""
    d=(date.getDate())+""
    if(m.length==1) m = "0"+m
    if(d.length==1) d = "0"+d
    return d+"/"+m+"/"+y
}

function sum(x){
    var acc = 0;
    for(const i in x) acc+=x[i]
    return acc
}

function int_to_arr(timestamp)
{
    var date = new Date(timestamp * 1000)
    var y, m, d
    y=(date.getFullYear())
    m=(date.getMonth()+1)
    d=(date.getDate())
    return [d,m,y]
}

function date_now_int() {
    return Date.now()/1000
}

function date_now_str() {
    return int_to_date(date_now_int())
}

function date_now_arr() {
    return int_to_arr(date_now_int())
}

