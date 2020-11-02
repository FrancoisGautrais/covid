class GraphEditorModal extends AbsModal{
    constructor(){
        super("graph-editor")
        this.id=null
        this.chart=null
        this._fill_select()
        this.villeSelect=$("#villes-select")
        this.depSelect=$("#departements-select")

        for(var i=0; i<METROPOLES.length; i++)
        {
            var v = METROPOLES[i]
            this.villeSelect.append($('<option value="'+v+'">'+v+'</option>'))
        }
        for(var i=0; i<DEPARTEMENTS.length; i++)
        {
            var v = DEPARTEMENTS[i]
            this.depSelect.append($('<option value="'+v+'">'+v+" -" +dep_list[v]+'</option>'))
        }
        App.formSelect()
        $('.datepicker').pickadate({
            selectMonths: true,
            selectYears: 15,
            today: 'Aujourd\'hui',
            clear: 'Effacer',
            close: 'Ok',
            format: "dd/mm/yyyy",
            closeOnSelect: true,
        });
    }

    _fill_select(){
    }

    on_zone_change(){
        if(this.fields.zone=="metropole"){
            $("#zone-departement").hide()
            $("#zone-metropole").show()
        }else{
            $("#zone-metropole").hide()
            $("#zone-departement").show()
        }
    }

    onOpen(){
        if(this.id){
            var chart = App.chartsIndex[this.id]
            var m = chart.settings.table=="metropole"
            console.log("Table = ", chart.settings.table)
            this.set_fields({
                "id" : null,
                "action" : "Modifier ",
                "name" : chart.name,
                "zone" : chart.settings.table,

                "departements" : m?[]:chart.settings.zones,
                "dep-age" : ""+(m?0:chart.settings.age),
                "villes" : m?chart.settings.zones:[],
                "villes-age" : (m?chart.settings.age:0),
                "begin_at_zero" : true,/*
                "datemin" : chart.settings.datemin?int_to_date(chart.settings.datemin):"",
                "datemax" : chart.settings.datemax?int_to_date(chart.settings.datemax):""*/
                "datemin" : chart.settings.datemin,
                "datemax" : chart.settings.datemax
            })

        }
        else{
            this.chart=null
            this.set_fields({
                "id" : null,
                "action" : "Ajouter ",
                "name" : "",
                "departements" : [],
                "dep-age" : "0",
                "zone" : "metropole",
                "villes" : [],
                "villes-age" : "0",
                "begin_at_zero" : true,
                "datemin" : "",
                "datemax" : ""
            })
        }
        this.on_zone_change()
        App.formSelect()
    }

    open(id){
        this.id=id
        super.open()
    }

    valid(){
        var chart = null
        if(this.id){
            App.chartsIndex[this.id].load({
                settings:{
                    table : this.fields.zone,
                    age : parseInt((this.fields.zone=="metropole")?this.fields.villes_age:this.fields.departements_age),
                    zones : (this.fields.zone=="metropole")?this.fields.villes:this.fields.departements,
                    datemin: this.fields.datemin,
                    datemax: this.fields.datemax,
                    table: this.fields.zone
                },
                id: this.id,
                begin_at_zero: this.fields.begin_at_zero,
                name: this.fields.name
            })

            /*
            chart.set_begin_at_zero(this.fields.begin_at_zero)
            chart.set_name(this.fields.name)
            API.query(data, {
                success: function(data) {
                    chart.set_multiple_data(data)
                }
            })*/
        }
        else{
            var opt = {
                begin_at_zero: this.fields.begin_at_zero,
                name: this.fields.name,
                settings: {
                    datemin: this.fields.datemin,
                    datemax: this.fields.datemax
                }
            }
            if(this.fields.zone=="metropole"){
                chart = App.add_multiple_chart_metro(this.fields.villes, parseInt(this.fields.villes_age), opt)
            }else{
                chart = App.add_multiple_chart_dep(this.fields.departements, parseInt(this.fields.departements_age), opt)
            }
        }
        this.close()
    }
}
AbsTab.register(GraphEditorModal, "GraphEditor")