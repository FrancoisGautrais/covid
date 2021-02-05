
var M = null;
var App = null

var METROPOLES = [
 "Bordeaux",  "Brest", "Clermont-Auvergne",  "Dijon", "Grenoble", "Lille", "Lyon", "Marseille", "Metz", "Montpellier", "Nancy",
  "Nantes", "Nice", "Orléans", "Paris", "Rennes", "Rouen", "Saint Etienne", "Strasbourg", "Toulon", "Toulouse", "Tours"
]
var METROPOLES_AGE = [ 0, 65]

var DEPARTEMENTS = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "21", "22", "23", "24", "25", "26", "27", "28", "29", "2A", "2B", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "90", "91", "92", "93", "94", "95", "971", "972", "973", "974", "975", "976", "977", "978"]
var DEPARTEMENTS_AGE = [0, 9, 19, 29, 39, 49, 59, 69, 79, 89, 90]


var dep_list = {"01":"Ain","02":"Aisne","03":"Allier","05":"Hautes-Alpes","04":"Alpes-de-Haute-Provence","06":"Alpes-Maritimes","07":"Ardèche","08":"Ardennes","09":"Ariège","10":"Aube","11":"Aude","12":"Aveyron","13":"Bouches-du-Rhône","14":"Calvados","15":"Cantal","16":"Charente","17":"Charente-Maritime","18":"Cher","19":"Corrèze","2a":"Corse-du-sud","2b":"Haute-corse","21":"Côte-d'or","22":"Côtes-d'armor","23":"Creuse","24":"Dordogne","25":"Doubs","26":"Drôme","27":"Eure","28":"Eure-et-Loir","29":"Finistère","30":"Gard","31":"Haute-Garonne","32":"Gers","33":"Gironde","34":"Hérault","35":"Ile-et-Vilaine","36":"Indre","37":"Indre-et-Loire","38":"Isère","39":"Jura","40":"Landes","41":"Loir-et-Cher","42":"Loire","43":"Haute-Loire","44":"Loire-Atlantique","45":"Loiret","46":"Lot","47":"Lot-et-Garonne","48":"Lozère","49":"Maine-et-Loire","50":"Manche","51":"Marne","52":"Haute-Marne","53":"Mayenne","54":"Meurthe-et-Moselle","55":"Meuse","56":"Morbihan","57":"Moselle","58":"Nièvre","59":"Nord","60":"Oise","61":"Orne","62":"Pas-de-Calais","63":"Puy-de-Dôme","64":"Pyrénées-Atlantiques","65":"Hautes-Pyrénées","66":"Pyrénées-Orientales","67":"Bas-Rhin","68":"Haut-Rhin","69":"Rhône","70":"Haute-Saône","71":"Saône-et-Loire","72":"Sarthe","73":"Savoie","74":"Haute-Savoie","75":"Paris","76":"Seine-Maritime","77":"Seine-et-Marne","78":"Yvelines","79":"Deux-Sèvres","80":"Somme","81":"Tarn","82":"Tarn-et-Garonne","83":"Var","84":"Vaucluse","85":"Vendée","86":"Vienne","87":"Haute-Vienne","88":"Vosges","89":"Yonne","90":"Territoire de Belfort","91":"Essonne","92":"Hauts-de-Seine","93":"Seine-Saint-Denis","94":"Val-de-Marne","95":"Val-d'oise","976":"Mayotte","971":"Guadeloupe","973":"Guyane","972":"Martinique","974":"Réunion" }


class Application {
    DBG=null
    constructor() {
        App=this
        this.tabs={}
        this.nav={}
        this.classes={}
        this.categories={}
        this._init()
        this.expressions={}
        this.charts=[]
        this.chartsIndex={}
        this.root=$("#main-root")
        this.load()
    }


    formSelect(selector='select') {
        $(selector).material_select();
        $(selector).each(function(x,y){
            x=$(y)
            var name =x.attr("name")
            var placeholder =x.attr("placeholder")
            if(name){
                x.parent().find("input").attr("name", name)
            }
            if(placeholder){
                x.parent().find("input").attr("placeholder", placeholder)
            }
        })
    }

    _init() {
        M=Materialize;
        var self = this;
        $('.modal').modal();
        $('.dropdown-trigger').dropdown();
        this.formSelect()
        $('.tooltipped').tooltip();
        this.tabs = $('#tab-root')
        this.tabs.tabs();
        this.nav = $(".button-collapse")
        this.nav.sideNav({
              menuWidth: 300,
              edge: 'left',
              closeOnClick: true,
              draggable: true
        });
        $("#sidenav-overlay").remove()

        if($("#tab-root").length)
            $("#tab-root > .tab").each(function (i, e){
                var e = $(e)
                TABS[e.attr("id")]=e
            });
        AbsModal.init()
    }

    refreshExpression(){
        ExprEditor.refresh()
        ExprManager.refresh()
        timeChartUI.updateRequest()
    }

    refreshCategories(){
        CategoryManager.refresh()
        CategoryEditor.refresh()
        PatternEditor.refresh()
        globalChartUI.updateCategories()
        timeChartUI.updateCategories()
    }


    toast(html) {
        M.toast(html, 30*60)
    }

    url(_url){ window.location.href=_url}


    add_simple_metro(url) {

    }

    add_simple_chart_metro(ville, age=0, opt={}) {
        var tmp = new Graphique(this.root, opt)
        this.charts.push(tmp)
        this.chartsIndex[tmp.id]=tmp
        API.metropole(ville, 0, {
            success: function(data) {
                tmp.set_simple_data(data)
            }
        })
        return tmp
    }

    add_simple_chart_dep(dep, age=0, opt={}) {
        var tmp = new Graphique(this.root, opt)
        this.charts.push(tmp)
        this.chartsIndex[tmp.id]=tmp
        API.departement(dep, 0, {
            success: function(data) {
                tmp.set_simple_data(data)
            }
        })
        return tmp
    }

    add_multiple_chart_metro(villes, age=0, opt={}){
        var tmp = new Graphique(this.root, opt)
        this.charts.push(tmp)
        this.chartsIndex[tmp.id]=tmp

        var data = {
            "table" : "metropole",
            "age" : age,
            "metropoles" : villes,
            datemin: opt.settings.datemin,
            datemax: opt.settings.datemax
        }
        API.query(data, {
            success: function(d) {
                tmp.set_multiple_data(d)
            }
        })
        return tmp
    }

    add_multiple_chart_dep(deps, age=0, opt={}){
        var tmp = new Graphique(this.root, opt)
        this.charts.push(tmp)
        this.chartsIndex[tmp.id]=tmp

        var data = {
            "table" : "departement",
            "age" : age,
            "departements" : deps,
            datemin: opt.settings.datemin,
            datemax: opt.settings.datemax
        }
        API.query(data, {
            success: function(d) {
                tmp.set_multiple_data(d)
            }
        })
        return tmp
    }

    save(){
        var out =[]
        for(const key in App.chartsIndex)
            out.push(App.chartsIndex[key].json())
        LOCAL.set("charts", JSON.stringify(out))
    }

    load(){
        var str = LOCAL.get("charts")
        Application.DBG=str
        if(str){

            var d = JSON.parse(str)
            if(d){

                for(const i in d){
                    var chart = d[i]
                    var tmp = new Graphique($("#main-root"), chart)
                    App.chartsIndex[tmp.id]=tmp
                    tmp.load(chart)
                    App.charts.push(tmp)
                }
            }
        }else
        {
            GraphEditor.open()
        }
    }

}

function edit_graph(id){
    GraphEditor.open(id)
}

function remove_graph(id){
    var graph = App.chartsIndex[id]
    $("#"+id+"_root").remove()
    delete App.chartsIndex[id]
    App.save()
}

function delete_data() {
    Confirm.open("Suppresion des données","Voulez vous supprimer les donnez locales. Vos graphiques seront perdus",
    function(){
        LOCAL.remove("charts")
        window.location.href=window.location.href;
    })
}

function fullscreen_graph(id){
    var chart = App.chartsIndex[id]
    chart.fullscreen()
}

$(document).ready(function(){
    if("App" in window){
        new Application()
    }
})