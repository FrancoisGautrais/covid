
var M = null;
var App = null

var METROPOLES = [
 "Bordeaux",  "Brest", "Clermont-Auvergne",  "Dijon", "Grenoble", "Lille", "Lyon", "Marseille", "Metz", "Montpellier", "Nancy",
  "Nantes", "Nice", "Orléans", "Paris", "Rennes", "Rouen", "Saint Etienne", "Strasbourg", "Toulon", "Toulouse", "Tours"
]

class ChartPage {
    constructor() {
        App=this
        this.tabs={}
        this.nav={}
        this.classes={}
        this.categories={}
        this._init()
        this.expressions={}
        this.charts=[]
        this.root=$("#main-root")
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

    add_simple_chart_metro(ville, age=0) {
        var tmp = new Graphique(this.root)
        this.charts.push(tmp)
        API.metropole(ville, 0, {
            success: function(data) {
                tmp.set_simple_data(data)
            }
        })
    }
}


$(document).ready(function(){
    if("App" in window){
        new ChartPage()
    }
})