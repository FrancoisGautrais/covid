

class Api
{
    constructor(){
        this.url_base=""
    }

    url(x){
        var sep = ""
        if(x[0]!='/') sep = "/"
        return  x
    }

    _ajax(url, ajax={}, headers={}, success=null, errorFct=null, errorText=null){
        var async=(success || errorFct || errorText)?true:false
        if(errorFct){
            var oldfct=errorFct
            errorFct=function(_a, _b, _c) {
                if(!(!_a && _b=="error" && _c==""))
                {
                    var resp = JSON.parse(_a.responseText);
                    error( (errorText?errorText:"Erreur")+ "( "+resp.code+" : '"+resp.message+"') : " + JSON.stringify(resp.data))
                }else{
                    error( "Erreur : Le serveur a clos la connexion")
                }
                Loading.close()
                oldfct(resp, _b, _c)
            }
        }
        if(errorFct==null){
            errorFct=function(_a, _b, _c) {
                if(!(!_a && _b=="error" && _c==""))
                {
                    var resp = JSON.parse(_a.responseText);
                    error( (errorText?errorText:"Erreur")+ "( "+resp.code+" : '"+resp.message+"') : " + JSON.stringify(resp.data))
                }else{
                    error( "Erreur : Le serveur a clos la connexion")

                }
                Loading.close()
            }
        }
        if(success){
            var oldsuccess=success;
            success= function(x) { return oldsuccess(x.data) }
        }

        var param = Object.assign({}, {
            type: 'get',
            url: this.url(url),
            async: async,
            dataType : "json",
            headers: headers,
            success :  success,
            error : errorFct
        }, ajax)
        //console.log("Request : ",param)

        var out = $.ajax(param)
        if(!async){
            return JSON.parse(out.responseText)
        }
        return out
    }

    ajax_get(url, opt={}){
        opt=Object.assign({
            headers : {}, ajax: {}, success : null, errorFct : null, errorText :null}, opt)
        return this._ajax(url, opt.ajax, opt.headers, opt.success, opt.errorFct, opt.errorText)
    }

    ajax_delete(url, opt={}){
        opt=Object.assign({headers : {}, ajax: {}, success : null, errorFct : null, errorText :null}, opt)
        return this._ajax(url, Object.assign({type: 'delete'}, opt.ajax), opt.headers, opt.success, opt.errorFct, opt.errorText)
    }

    ajax_post(url, data=null, opt={}){
        opt=Object.assign({ ajax : {}, headers : {}, success : null, errorFct : null, errorText :null}, opt)
        return this._ajax(url, Object.assign({type: 'post', data: JSON.stringify(data)}, opt.ajax),
                Object.assign({"Content-Type": "application/json"}, opt.headers), opt.success, opt.errorFct, opt.errorText)
    }

    ajax_put(url, data=null, opt={}){
        opt=Object.assign({ ajax : {}, headers : {}, success : null, errorFct : null, errorText :null}, opt)
        return this._ajax(url, Object.assign({type: 'put', data: JSON.stringify(data)}, opt.ajax),
                Object.assign({"Content-Type": "application/json"}, opt.headers), opt.success, opt.errorFct, opt.errorText)
    }


    metropole(ville, age, opt){
        return this.ajax_get("/query/metropole/"+ville+"/age/"+age, opt)
    }

    departement(ville, age, opt){
        return this.ajax_get("/query/departement/"+ville+"/age/"+age, opt)
    }

    query(data, opt){
        return this.ajax_post("/query", data, opt)
    }

}

var API = new Api()

/*
    openModify(patid, catid) { this.open({ action: 'modify', catid: catid, patid: patid }) }
    openModifyTemp(patid) { this.open({ action: 'modify_temp', pat: pat }) }
    openNewFromCategory(catid) { this.open({ action: 'new_from_cat', catid: catid}) }
    openNewFromCategoryTemp(patid) { this.open({ action: 'new_from_cat_temp', patid: patid}) }
    openNewFromOperation(opid) { this.open({ action: 'new_from_op', catid: catid }) }
*/