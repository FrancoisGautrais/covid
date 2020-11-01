
function toggleFullscreen(elem) {
  elem = elem || document.documentElement;
  if (!document.fullscreenElement && !document.mozFullScreenElement &&
    !document.webkitFullscreenElement && !document.msFullscreenElement) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}

var COLORS = [
    0x6ACDCCFF, 0xC3B74BFF, 0x57C757FF, 0xD7A988FF, 0xDDCE98FF, 0xC6ECCBFF, 0xCDD2EEFF, 0xCBBAE8FF, 0xCD756AFF, 0x90DAA6FF
]

function rgba(c, alpha=null) {
    var r,g,b,a;
    r=(c>>(8*3))&0xff;
    g=(c>>(8*2))&0xff;
    b=(c>>(8*1))&0xff;
    a=((alpha==null)?((c)&0xff):alpha)/255.0;
    return "rgba("+r+", "+g+", "+b+", "+a+")"

}

class Graphique {

    constructor(root, opt={}){
        var self = this;
        console.log("Graphique::constructor : ", opt)
        this.name = ("name" in opt)?opt.name:""
        this.begin_at_zero = ("begin_at_zero" in opt)?opt.begin_at_zero:true
        this.id= ("id" in opt)?opt["id"]:Utils.randomId()
        this.create_root(root, opt)
        this.canvas.dblclick(function(){self.fullscreen()})
        this.ctx = this.canvas[0].getContext('2d');

        this.chart = new Chart(this.ctx, {
            type: 'line',
            data:  {/*
                labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
                datasets: [{
                    label: '# of Votes',
                    data: [0,1,2,3,4,5],
                    borderColor:  'rgba(255, 99, 132, 1)',
                    backgroundColor:  'rgba(0, 0, 0, 0)',
                    borderWidth: 1
                }]*/
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: this.begin_at_zero
                        }
                    }]
                }
            }
        });

    }

    load(opt){
        var self = this;
        this.id=opt.id;
        this.name=opt.name;
        this.begin_at_zero=opt.begin_at_zero;
        this.settings=opt.settings;
        console.log("opt = ", opt)
        var data = {
            table : this.settings.table,
            age : this.settings.age,
            departements : this.settings.zones,
            metropoles : this.settings.zones,
            datemin: this.settings.datemin,
            datemax: this.settings.datemax
        }
        console.log("data = ", data)
        this.set_begin_at_zero(this.begin_at_zero)
        this.set_name(this.name)
        API.query(data, {
            success: function(d) {
                self.set_multiple_data(d)
            }
        })
    }

    set_begin_at_zero(b){
        this.begin_at_zero=b
        this.chart.options.scales.yAxes[0].ticks.beginAtZero=b
    }

    set_name(name){
        this.name=name
        $("#"+this.id+"_name").html(name)
    }

    create_root(root, opt){
        if(Object.keys(opt).length){
            this.root=$('<div id="'+this.id+'_root" class="chart-root"></div>')

            this.liTitle=$('<div class="graph_header"><h6 id="'+this.id+'_name" >'+this.name+'</h6></div>')
            this.liTitle.append($('<a class="right" onclick="remove_graph(\''+this.id+'\')"><i class="material-icons">remove</i></a>'))
            this.liTitle.append($('<a class="right" onclick="edit_graph(\''+this.id+'\')"><i class="material-icons">edit</i></a>'))
            this.liContent=$('<div class="chart-container"></div>')

            this.legendRoot = $('<i class="chart-source"></i>')
            this.canvas = $('<canvas ></canvas>')

            this.root.append(this.liTitle)
            this.root.append(this.liContent)
            //this.root.append(this.legendRoot)
            this.liContent.append(this.canvas)
            this.liContent.append(this.legendRoot)
            root.append(this.root)
            //this.liContent.append($('<'))
            $('.collapsible').collapsible();
        } else {
            this.root=$('<div class="chart-container"> </div>')
            this.legendRoot = $('<i class="chart-source"></i>')
            this.canvas = $('<canvas width="400" height="400"></canvas>')
            this.root.append(this.canvas)
            this.root.append(this.legendRoot)
            root.append(this.root)
        }

    }

    json(){
        return {
            load: true,
            id: this.id,
            name: this.name,
            begin_at_zero: this.begin_at_zero,
            settings: this.settings
        }
    }

    update(){
        this.chart.resize()
        this.chart.update()
        this.chart.resize()
    }

    fullscreen(){
        toggleFullscreen(this.canvas.parent()[0])
    }

    set_legend(legend){
        this.legendRoot.empty()
        this.legendRoot.append("Sources: "+legend.source+' <a href="'+legend.url+'">'+legend.url+'</a> ('+legend.last_update+')')
    }

    set_simple_data(data){
        this.data={}
        this.chart.data.datasets=[]
        this.set_legend(data.legend)
        this.set_label(data)
        this.add_dataset_from_simple(COLORS[Utils.getRandomInt(COLORS.length-1)], data)
        this.chart.options.title={
            display: true,
            text: "Taux d'incidence par "+data.table
        }
        this.update()
        var chart = this.chart
        setTimeout(function(){chart.resize()}, 1000)
    }

    set_multiple_data(data){
        this.settings={
            table: data.table,
            age: data.age,
            zones: data.zones,
            datemin: data.datemin,
            datemax: data.datemax
        }
        this.data={}
        this.chart.data.datasets=[]
        this.set_legend(data.legend)
        var isMetro = data.table=="metropole"
        var field = isMetro?"metropoles":"departements"

        this.chart.data.labels=data.labels.map(x => x.substr(0,10));
        var chart = this.chart

        var d = data.data;

        for(var i=0; i<d.length; i++)
        {
            var label = data.headers[i]
            var dd = data.data[i]
            var col = COLORS[i%COLORS.length]
            this.add_dataset(col, label, dd, false)
        }
        this.update()
        setTimeout(function(){chart.resize()}, 1000)
        App.save()

    }

    set_label(data){
         var labels = []
         var d = data.data;
         for(var i=0; i<d.length; i++){
             labels.push(d[i][0].substr(0,10))
         }
         this.chart.data.labels=labels
    }

    add_dataset_from_simple(color, data){
        var isMetro = data.table=="metropole"
        var out = []
        var labels = []
        var d = data.data;
        for(var i=0; i<d.length; i++){
            out.push(d[i][isMetro?2:4])
        }
        this.add_dataset(color, data[data.table], out, data.type=="simple")
    }


    add_dataset(color, label, data, isSimple=false){
        this.chart.data.datasets.push({
            label: label,
            data: data,
            borderColor:  rgba(color), //'rgba(255, 99, 132, 1)',
            backgroundColor: rgba(color, isSimple?0x7f:0),
            borderWidth: 1
        })
    }
}






