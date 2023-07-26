sap.ui.define([
    "sap/m/MessageToast"
], function(MessageToast) {
    'use strict';

    return {
        onListNavigationExtension: function(oEvent) {
            var oBindingContext = oEvent.getSource().getBindingContext();
            var oObject = oBindingContext.getObject();
            var sNavigationProperty;
            console.log(oObject)
            // Condiditon addition as customer type 'BK' without transportorder should be visible in regular bag picking screen
            if (oObject.transportOrder != null && oObject.transportOrder != "" ) 
            {
            // switch (oObject.custtype){
                // case "BK":
                switch (oObject.shipping_type){
                    case "z1":
                    sNavigationProperty = "to_Bakery";
                    break;
                    case "Z1":
                    sNavigationProperty = "to_Bakery";
                    break;
                }
            }
            if (sNavigationProperty) {
                
                var oExtensionAPI = this.extensionAPI;
                var oNavigationController = oExtensionAPI.getNavigationController();
                var oModel = oBindingContext.getModel();
                var transportOrder = oObject.transportOrder;
                var custtype = oObject.custtype;
                var outboundDelivery = oObject.outboundDelivery;
                var sPath = "/ZSCM_I_Bakery_L2(transportOrder='"+transportOrder+"',custtype='"+custtype+"',outboundDelivery='"+outboundDelivery+"')";
                var oTarget = new sap.ui.model.Context(oModel, sPath);
                oNavigationController.navigateInternal(oTarget);

                var oupdateSequence = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZSCM_PICKINGACTION_SRV");

                oupdateSequence.callFunction("/updateSequence", {
                    method: "POST",
                    urlParameters: {   
                        transportorder : transportOrder
                    } 
                });
                return true;
            }
            return false;
                
        },  
    };
});