

class Utils {
    static _validChars="abcdefghijklmnopqrstuvwxyz0123456789 /._-âêîôûàèùéœæ"
    static _validIdChars="abcdefghijklmnopqrstuvwxyz_-"
    static validateName(name){
        if(!name) return "Champs vide ou indéfini"
        if(!name.length) return "Champs vide"
        for(const i in name){
            if(Utils._validChars.indexOf(name[i].toLowerCase())<0)
                return "Caractère '"+name[i]+"' interdit"
        }
        return null
    }

    static getRandomInt(max) {
      return Math.floor(Math.random() * Math.floor(max));
    }

    static randomId(n=32){
        var out=""
        for(var i=0; i<n; i++){
            out+=Utils._validIdChars[Utils.getRandomInt(Utils._validIdChars.length-1)]
        }
        return out
    }
}