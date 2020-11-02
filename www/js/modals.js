

class DataBind {
    /*
        data-bind="NAME[:TYPE]" -> this.NAME (TYPE: default str)
        data-on="METOD:EVENT" -> this.METHOD(elem)
    */
    static __events=[null, "change", "keyup", "keydown", "click", "paste"]
    constructor(domid){
        this.__id=domid
        this.fields={}
        this.__cb_object={}
        this.__cb_callbacks={}
        this._root=$("#"+this.__id)
        this._updateBind()

    }

    __get_callback(e){
        if(!("length" in e)) e=$(e)
        var elem = e[0]
        for(const id in this.__cb_object){
            if(elem==this.__cb_object[id]) return this.__cb_callbacks[id]
        }
        var id = Utils.randomId()
        this.__cb_callbacks[id] = {
        }
        this.__cb_object[id] = elem
        return this.__cb_callbacks[id]
    }
    on(e, event, src, fct){
        var self = this
        if(!("length" in e)) e=$(e)
        var self = this
        var cbo = this.__get_callback(e)
        if(!(event in cbo) ){
            self.__set_base_callback(e, event);
        }
        cbo[event][src]=fct
    }
    __set_base_callback(e, event){
        if(!("length" in e)) e=$(e)
        var self = this
        var cbo = this.__get_callback(e)
        if(!(event in cbo) ){
            cbo[event]={}
            e.on(event, function(){
                var cb = cbo[event];
                if("bind" in cb){
                    cb["bind"](e)
                }
                for(const key in cb){
                    if(key!="bind"){
                        cb[key](e)
                    }
                }
            })
        }

    }

    _updateBind(){
        var self = this
        for(const i in DataBind.__events){
            var evt = DataBind.__events[i]
            var suffix =(evt)?("-"+evt):""
            this._root.find("[data-bind"+suffix+"]").each(function(i,e){
                self._bindData($(e), evt, suffix)
            })
            this._root.find("[data-on"+suffix+"]").each(function(i,e){
                self._bindOn($(e), evt, suffix)
            })
        }
        this.updateFields()
    }

    __get_field(e){
        var tag = e.prop("tagName").toLowerCase()
        var bind = e.data("bind").split(":")
        var type = (bind.length>1)?bind[1]:"string"
        var value = null

        switch(tag){
            case "input":
                switch(e.attr("type")){
                    case "checkbox":
                        value=e.is(":checked")
                        type="bool"
                        break;
                    default:
                        if(e.hasClass("datepicker")){
                            type="date"
                        }
                        value=e.val()
                        break

                }break;
            case "select":
                value=e.val()
                break
            default:
                value=e.html()
        }

        switch(type){
            case "int":
                value=parseInt(value)
                break;
            case "float":
                value=parseInt(value)
                break;
            case "date":
                value=date_to_int(value)
                break;
            case "bool":

                value=((""+value).toLowerCase()!="false") && (value!="0")
                break;
        }

        this.fields[bind[0]]=value
    }

    getElemByBind(f){
        for(const key in DataBind.__events){
            var evt = DataBind.__events[key]
            var suffix = (evt)?("-"+evt):""
            var tmp = this._root.find("[data-bind"+suffix+"="+f+"]")
            if(tmp.length) return tmp
        }
        return null
    }

    __set_field(e, value){
        var tag = e.prop("tagName").toLowerCase()
        var bind = e.data("bind").split(":")
        var type = (bind.length>1)?bind[1]:"string"
        this.fields[bind[0]]=value

        switch(tag){
            case "textarea":
            case "input":
                switch(e.prop("type")){
                    case "checkbox":
                        value=e.prop("checked", !(((""+value).toLowerCase()!="false") && (value!="0")))
                        break;
                    default:
                        if(e.hasClass("datepicker")){
                            type="date"
                            value=e.val(int_to_date(value))
                        }
                        else {
                            value=e.val(value)
                        }
                        break

                }break;
            case "select":
                value=e.val(value)
                App.formSelect()
                break
            default:
                value=e.html(value)
        }
    }

    _bindData(e, event=null, suffix){
        var self = this
        event=this.__find_evt(e, event)

        if(!event) event="change"
        this.on(e, event, "bind", function(){
            self.__get_field(e)
        })
    }

    _bindOn(e, evt=null, suffix){
        var self = this
        var method = e.data("on"+suffix)
        evt=this.__find_evt(e, event)

        this.on(e, evt, "on" ,function(){
            var x = e.data("args")
            if(!x){
                self[method](e, evt)
            }else{
                x=eval(x)
                if(Array.isArray(x)){
                    self[method](...x)
                }else{
                    self[method](x)
                }
            }
        })
    }


    __find_evt(e, evt){
        var tag = e.prop("tagName").toLowerCase()
        if(evt) return evt
        switch(tag){
            case "a":
            case "button":
                evt = "click"
            break;
            case "input":
                switch(e.attr("type")){
                    case "text":
                    case "number":
                    case "email":
                    case "password":
                    case "search":
                    case "tel":
                    case "url":
                        evt = "keyup"
                        if(e.hasClass("datepicker")) evt="change";
                        break;
                    default:
                        evt = "change"
                }
                break;
            default:
                evt = "change"
        }
        return evt

    }

    field(name, val){
        if(typeof name == "string"){
            var e = this._root.find("[data-bind="+name+"]")
            if(!e) e= this._root.find("[data-bind^="+name+"]:")
            if(e.length){
                if(val==undefined){
                    this.__get_field(e)
                }else{
                    this.__set_field(e, val)
                }
            }
        }else{
            for(const key in name){
                this.field(key, name[key])
            }
        }
    }

    set_fields(obj){
        for(const key in obj){
            this.field(key, obj[key])
        }
        Materialize.updateTextFields();
        App.formSelect()
    }

    updateFields(){
        var self = this
        this._root.find("[data-bind]").each(function(i,e){
            self.__get_field($(e))
        })
        return this.fields
    }

    cb(e, f){
        alert("--- "+e+" "+f)
    }

}




class AbsModal extends DataBind{
    static _instances = []
    static _subclass=[]
    static _stack=[]
    static register( classe, name){
        AbsModal._subclass.push([classe, name])
    }

    static init(){
        AbsModal._instances = []
        for(var i=0; i<AbsModal._subclass.length; i++)
        {
            var obj = new AbsModal._subclass[i][0]();
            AbsModal._instances.push(obj)
            window[AbsModal._subclass[i][1]] = obj
        }
    }

    constructor(modal_id, opt={}){
        super(modal_id)
        this.modal_id=modal_id
        this.modal=$("#"+modal_id)
        var _this = this
        this._n_open=0
        this.__is_visible=false
        this.isOpen=false;
        this._element = $("#"+modal_id)
        this.modal_instance = this.modal.modal(
            {
              ready: function(modal, trigger) { _this.isOpen=true; _this.onOpen()  },
              complete: function() {
                _this.isOpen=false;
                _this.onClose()
              }
            }
          )
    }

    __set_visibility(val)
    {
        this.__is_visible=val
    }

    onClose(){}

    maxZIndex() {
        var max=2000;
        $(".modal:visible").each(function(i, e){
            var z =  parseInt($(e).css("z-index"))
            if(z>max) max=z;
        })
        return max+10;
    }

    close(){
        if(this.isOpen) this.modal.modal("close")
    }

    refresh() {
        throw 'Error'
    }

    onOpen(){}

    open(){
        //console.log("Open: "+this.modal_id)
        var zmax = this.maxZIndex()
        this.modal.modal("open")
        this._element.css("z-index", zmax+"")
    }
}

class AbsTab extends DataBind {
    static _instances = []
    static _subclass=[]
    static register( classe, name){
        AbsModal._subclass.push([classe, name])
    }

    constructor(id){super(id);}
}

class ModLoading extends AbsModal {
    static DEFAULT_MESSAGE = "Requête en cours, merci de patienter"
    constructor(){ super("loading") }

    open(text="") {
        text=(text.length>0)?text:ModLoading.DEFAULT_MESSAGE
        $("#loading-text").html(text)
        super.open()
    }
}
AbsTab.register(ModLoading, "Loading")
function loading(text){
    Loading.open(text)
}



class ModError extends AbsModal {
    static DEFAULT_TITLE = "Erreur"
    constructor(){ super("error") }


    open(title, text="") {
        if(!text.length){
            text=title;
            title=ModError.DEFAULT_TITLE
        }
        $("#error-title").html(title)
        $("#error-text").html(text)
        super.open()

    }
}
AbsTab.register(ModError, "_Error")


function error(title, text=""){
    _Error.open(title, text)
    Loading.close()
}



class ModConfirm extends AbsModal {
    constructor(){ super("confirm") }

    open(title, text, onYes, onNo=null) {
        var self = this
        $("#confirm-title").html(title)
        $("#confirm-text").html(text)
        $("#confirm-no").off("click")
        $("#confirm-no").on("click", function(){
            self.close()
            if(onNo) onNo()
         })

        $("#confirm-yes").off("click")
        $("#confirm-yes").on("click", function(){
            self.close()
            if(onYes) onYes()
         })
         super.open()
    }


}
AbsTab.register(ModConfirm, "Confirm")

function confirm(title, text, onYes, onNo=null){
    Confirm.open(title, text, onYes, onNo)
}


