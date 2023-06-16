sap.ui.define([
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function(MessageToast, MessageBox) {
    'use strict';

    return {
        scanHU: function(oEvent) {
            var outboundDelivery = "000000000" + oEvent.getSource().getParent().getParent().getBindingContext().getObject().outboundDelivery;
            var shipTo = oEvent.getSource().getParent().getParent().getBindingContext().getObject().shipTo;
            var item = "0000" + oEvent.getSource().getParent().getParent().getSelectedContexts()[0].getObject().outboundDeliveryItem;
            var packInst = oEvent.getSource().getParent().getParent().getSelectedContexts()[0].getObject().packInst;
            var material = "000000000000" + oEvent.getSource().getParent().getParent().getSelectedContexts()[0].getObject().material;
            var uom = oEvent.getSource().getParent().getParent().getSelectedContexts()[0].getObject().uom;
            material = material.substr(material.length-18);
            item = item.substr(item.length-6);
            outboundDelivery = outboundDelivery.substr(outboundDelivery.length-10);
            var exists = 0;
            var finalHU
            var extensionAPI = this.extensionAPI
            
            var oButton2 = new sap.m.Button("Cancel", {
                text: "Cancel"
            });

            var oButton1 = new sap.m.Button("OK", {
                text: "OK"
            });

            var oDialog = new sap.m.Dialog("Dialog1",{
                title:"Enter HU/Container Number",
                contentWidth:"20%",
                closeOnNavigation: true,
                buttons: [oButton1, oButton2],
                content:[
                    new sap.m.Label({text:"HU/Container:", required: true}),
                    new sap.m.Input({maxLength: 20, id: "HUBarcode", type: "Text"}),
                ]
            });

            oButton2.attachPress(function (evt) {  
                oDialog.close();
                oDialog.destroy();
                oDialog = null;             
            })
            
            oButton1.attachPress(function (evt) {  
                if(((sap.ui.getCore().byId("HUBarcode").getValue()).substr(0,4)) == '(00)') {
                    var cutHU = (sap.ui.getCore().byId("HUBarcode").getValue()).substr(4, (sap.ui.getCore().byId("HUBarcode").getValue()).length - 1)
                    var HUleadingZeroes = "00000000000" + cutHU;
                    finalHU = HUleadingZeroes.substr(HUleadingZeroes.length-20);
                } else {
                    var HUleadingZeroes = "00000000000" + sap.ui.getCore().byId("HUBarcode").getValue();
                    finalHU = HUleadingZeroes.substr(HUleadingZeroes.length-20);
                }
                //check customer on HU matches customer on Delivery
                var oHUCheck = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZSCM_PICKINGAPP_SRV");
                oHUCheck.read("/ZSCM_I_HUCheck_Picking?$filter=extHU eq \'" + finalHU + "\'", {
                    success: function(oData, oResponse) {
                        var HUCustomer
                        var HUPackInst
                        var HUExist = 0
                        var doCheck = 0
                        if (oData.results[0] != undefined) {
                        HUCustomer = oData.results[0].customer
                        } else {
                            doCheck = 1
                        } if (oData.results[0] != undefined) {
                            HUPackInst = oData.results[0].packInst
                        }
                        if ((HUCustomer == shipTo && HUPackInst == packInst) || (doCheck == 1 && HUPackInst == packInst)) {
                            onContinueAddHU(oEvent, finalHU, item, material, uom, outboundDelivery, extensionAPI)
                        } else {
                            if (HUPackInst != packInst && HUCustomer != shipTo && HUCustomer != undefined) {
                                MessageBox.warning("Customer and Packaging Instructions on the HU does not match the Customer and Packaging Instructions on the Delivery. Would you like to continue?", {
                                    actions: ["OK", MessageBox.Action.CLOSE],
                                    emphasizedAction: "OK",
                                    onClose: function (sAction) {
                                        if (sAction == "OK") {
                                            onContinueAddHU(oEvent, finalHU, item, material, uom, outboundDelivery, extensionAPI)
                                        }
                                    }
                                });
                            } else if (HUPackInst != packInst) {
                                MessageBox.warning("Packaging Instruction on HU does not match Packaging Instruction on Delivery. Would you like to continue?", {
                                    actions: ["OK", MessageBox.Action.CLOSE],
                                    emphasizedAction: "OK",
                                    onClose: function (sAction) {
                                        if (sAction == "OK") {
                                            onContinueAddHU(oEvent, finalHU, item, material, uom, outboundDelivery, extensionAPI)
                                        }
                                    }
                                });
                            } else if (HUCustomer != shipTo && HUCustomer != undefined) {
                                MessageBox.warning("Customer on HU does not match Customer on Delivery. Would you like to continue?", {
                                    actions: ["OK", MessageBox.Action.CLOSE],
                                    emphasizedAction: "OK",
                                    onClose: function (sAction) {
                                        if (sAction == "OK") {
                                            onContinueAddHU(oEvent, finalHU, item, material, uom, outboundDelivery, extensionAPI)
                                        }
                                    }
                                });
                            } else {
                                console.log("here4")
                                sap.m.MessageBox.error("HU Not Found");
                            }
        
                        } 
                        oDialog.close();
                        oDialog.destroy();
                        oDialog = null;
                    },
                    error: function(oError) {
                        console.log(oError)
                        sap.m.MessageBox.error(oError);
                        oDialog.close();
                        oDialog.destroy();
                        oDialog = null;
                    }
                })
                
            })

            oDialog.addStyleClass("sapUiContentPadding");
            oDialog.open();
           
        },

        updateSeal: function(oEvent) {
            var material = oEvent.getSource().getParent().getParent().getBindingContext().getObject();
            var hu = oEvent.getSource().getParent().getParent().getSelectedContexts()[0].getObject().HUNum;
            var HUleadingZeroes = "00000000000" + hu;
            var finalHU = HUleadingZeroes.substr(HUleadingZeroes.length-20);
            var extensionAPI = this.extensionAPI

            var oButton2 = new sap.m.Button("Cancel", {
                text: "Cancel"
            });

            var oButton1 = new sap.m.Button("OK", {
                text: "OK"
            });

            oButton1.attachPress(function (evt) {
                var seal = sap.ui.getCore().byId("Seal").getValue()
                var oUpdateSeal = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZSCM_PICKINGACTION_SRV");

                oUpdateSeal.callFunction("/updateSealNumber", {
                    method: "POST",
                    urlParameters: {                    
                        HUNumber: finalHU,
                        sealNumber: seal
                    },
                    success: function(oData, oResponse) {
                        console.log(oData)
                        var message = oData.Message
                        var messageType = oData.Type
                        if (messageType == 'S') {
                            console.log(message)
                            sap.m.MessageToast.show(message);
                        } else {
                            sap.m.MessageBox.error(message);
                        }  
                        oDialog.close();
                        oDialog.destroy();
                        oDialog = null; 
                    },
                    error: function(oError) {
                        console.log(oError)
                        sap.m.MessageBox.error(oError);
                        oDialog.close();
                        oDialog.destroy();
                        oDialog = null; 
                    }, 
                })

            });

            oButton2.attachPress(function (evt) {
                oDialog.close();
                oDialog.destroy();
                oDialog = null; 
            });


            var oDialog = new sap.m.Dialog("Dialog1",{
                title:"Update Seal Number",
                contentWidth:"20%",
                closeOnNavigation: true,
                buttons: [oButton1, oButton2],
                content:[
                    new sap.m.Label({text:"Seal:"}),
                    new sap.m.Input({maxLength: 20, id: "Seal"})
                ]
            });
            oDialog.addStyleClass("sapUiContentPadding");
            oDialog.open()
        },

        addBatch: function(oEvent) {
            var material = oEvent.getSource().getParent().getParent().getSelectedContexts()[0].getObject().material;
            var item = "0000" + oEvent.getSource().getParent().getParent().getSelectedContexts()[0].getObject().outboundDeliveryItem;
            var delivery = "000000000" + oEvent.getSource().getParent().getParent().getSelectedContexts()[0].getObject().outboundDelivery;
            var plant = oEvent.getSource().getParent().getParent().getBindingContext().getObject().plant;
            delivery = delivery.substr(delivery.length-10);
            item = item.substr(item.length-6);
            var uom = oEvent.getSource().getParent().getParent().getSelectedContexts()[0].getObject().uom;
            var validBatch = 0
            var pickAmount = 0
            var exists = 0
            var extensionAPI = this.extensionAPI

            var oPickedAmount = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZSCM_PICKINGAPP_SRV");
            oPickedAmount.read("/ZSCM_BulkProd_L1?$filter=outboundDelivery eq \'" + delivery + "\' and outboundDeliveryItem eq \'" + item + "\'", {
                success: function(oData, oResponse) {
                    console.log(oData.results.length)
                    for(let i=0; i<(oData.results.length); i++) {
                        pickAmount += parseFloat(oData.results[i].plannedQuant, 10)
                        if(parseInt(mResult.text, 10) == parseInt(oData.results[i].plannedQuant, 10)) {
                            exists = 1
                        }
                    }
                    console.log(pickAmount)
                }
            })
                
                                    
            var oButton2 = new sap.m.Button("Cancel", {
                text: "Cancel"
            });

            var oButton1 = new sap.m.Button("OK", {
                text: "OK"
            });

            oButton1.attachPress(function (evt) {
                var batch = sap.ui.getCore().byId("Batch").getValue()
                var qty = sap.ui.getCore().byId("Qty").getValue()
                
                if(batch == "") {
                    sap.m.MessageToast.show("Please Enter Batch");
                } else if (qty == "") {
                    sap.m.MessageToast.show("Please Enter Qty");
                } else {
                    var obatchCheck = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZSCM_PICKINGAPP_SRV");
                    obatchCheck.read("/ZSCM_I_ValidBatch?$filter=Matnr eq \'" + material + "\' and Werks eq \'" + plant + "\' and Charg eq \'" + batch + "\'", {
                        success: function(oData, oResponse) {
                            if (oData.results.length > 0) {
                                var totalPick = pickAmount + parseFloat(qty)
                                var oAssignBatchEtag = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/API_OUTBOUND_DELIVERY_SRV;v=2");

                                oAssignBatchEtag.read("/A_OutbDeliveryItem(DeliveryDocument=\'" + delivery + "\',DeliveryDocumentItem=\'" + item + "\')", {
                                    success: function(oData, oResponse) {
                                        console.log(oData)
                                        console.log(oResponse.headers.etag)

                                        var oAssignBatch = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/API_OUTBOUND_DELIVERY_SRV;v=2", {
                                            headers: {
                                                "If-match" : "*"
                                            }
                                        });

                                        console.log("here")
                                        oAssignBatch.callFunction("/PickAndBatchSplitOneItem", {
                                            method: "POST",
                                            urlParameters: {                    
                                                DeliveryDocument: delivery,
                                                DeliveryDocumentItem: item,
                                                SplitQuantity: qty, 
                                                SplitQuantityUnit: uom,
                                                Batch: batch
                                            },
                                            success: function(oData, oResponse) {
                                                sap.m.MessageToast.show("Batch " + batch + " added to delivery " + delivery, {
                                                    duration: 3000,                  // default
                                                    width: "15em",                   // default
                                                    my: "center bottom",             // default
                                                    at: "center bottom",             // default
                                                    of: window,                      // default
                                                    offset: "0 0",                   // default
                                                    collision: "fit fit",            // default
                                                    onClose: null,                   // default
                                                    autoClose: true,                 // default
                                                    animationTimingFunction: "ease", // default
                                                    animationDuration: 1000,         // default
                                                    closeOnBrowserNavigation: true   // default
                                                });
                                                oDialog.close();
                                                oDialog.destroy();
                                                oDialog = null;     
                                                extensionAPI.refresh("pickingapp.pickingapp::sap.suite.ui.generic.template.ObjectPage.view.Details::ZSCM_PickList_S2_L1--BulkProd::Table")
                                                extensionAPI.refresh("pickingapp.pickingapp::sap.suite.ui.generic.template.ObjectPage.view.Details::ZSCM_C_PICKINGAPP--ScenarioNoHU::Table")
                                            },
                                            error: function(oError) {
                                                console.log(oError)
                                                sap.m.MessageBox.error(oError);
                                                oDialog.close();
                                                oDialog.destroy();
                                                oDialog = null;     
                                            }
                                        })
                                    }
                                })

                                
                            } else {
                                var sMsg = 'Invalid Batch.'
                                sap.m.MessageBox.error(sMsg);
                                oDialog.close();
                                oDialog.destroy();
                                oDialog = null;     
                            }
                        },
                        error: function (data) { 
                            console.log(data)        
                        }
                    });
                        
                }   
                

            });

            oButton2.attachPress(function (evt) {
                oDialog.close();
                oDialog.destroy();
                oDialog = null;    
            });



            var oDialog = new sap.m.Dialog("Dialog1",{
                title:"Add Batch",
                contentWidth:"20%",
                closeOnNavigation: true,
                buttons: [oButton1, oButton2],
                content:[
                    new sap.m.Label({text:"Batch:", required: true}),
                    new sap.m.Input({maxLength: 20, id: "Batch", type: "Text"}),
                    new sap.m.Label({text:"Qty:", required: true}),
                    new sap.m.Input({maxLength: 20, id: "Qty", type: "Number"})
                ]
            });

            oDialog.addStyleClass("sapUiContentPadding");
            oDialog.open()

        },

        removeBatch: function(oEvent) {
            var outboundDelivery1 = "000000000" + oEvent.getSource().getParent().getParent().getBindingContext().getObject().outboundDelivery;
            var deliveryNumber = outboundDelivery1.substr(outboundDelivery1.length-10);
            var batchItem = oEvent.getSource().getParent().getParent().getSelectedContexts()[0].getObject().outboundDeliveryItem;
            var batchQty = parseFloat(oEvent.getSource().getParent().getParent().getSelectedContexts()[0].getObject().plannedQuant);
            var totalPicked = 0
            var exists = 0
            var extensionAPI = this.extensionAPI

            // var oPickedAmount = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZSCM_PICKINGAPP_SRV");
            // oPickedAmount.read("/ZSCM_BulkProd_L1?$filter=outboundDelivery eq \'" + deliveryNumber + "\' and outboundDeliveryItem eq \'" + batchItem + "\'", {
            //     success: function(oData, oResponse) {
            //         console.log(oData.response.length)
            //         for(let i=0; i<(oData.response.length); i++) {
            //             totalPicked += parseFloat(oData.response[i].plannedQuant, 10)
            //             if(parseInt(mResult.text, 10) == parseInt(oData.response[i].plannedQuant, 10)) {
            //                 exists = 1
            //             }
            //         }
            //     }
            // })

            var oRemoveBatch = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZSCM_PICKINGACTION_SRV");

            oRemoveBatch.callFunction("/removeBatchFromDelivery", {
                method: "POST",
                urlParameters: {                    
                    deliveryNumber: deliveryNumber,
                    batchItem: batchItem,
                    HU_EXID: finalHU, 
                    material: material,
                    picked: '0',
                    batch: '', 
                    uom: uom,
                },
                success: function(oData, oResponse) {
                    sap.m.MessageToast.show("Batch removed", {
                        duration: 3000,                  // default
                        width: "15em",                   // default
                        my: "center bottom",             // default
                        at: "center bottom",             // default
                        of: window,                      // default
                        offset: "0 0",                   // default
                        collision: "fit fit",            // default
                        onClose: null,                   // default
                        autoClose: true,                 // default
                        animationTimingFunction: "ease", // default
                        animationDuration: 1000,         // default
                        closeOnBrowserNavigation: true   // default
                    });
                    extensionAPI.refresh("pickingapp.pickingapp::sap.suite.ui.generic.template.ObjectPage.view.Details::ZSCM_PickList_S2_L1--BulkProd::Table"); 
                },
                error: function(oError) {
                    var sMsg = 'Unable to remove Batch.'
                    sap.m.MessageToast.show(sMsg);
                }, 
            })
        },

        removeHUCont: function(oEvent) {
            var hu = "00000000000" + oEvent.getSource().getParent().getParent().getSelectedContexts()[0].getObject().HUNum;
            var outboundDelivery = "000000000" + oEvent.getSource().getParent().getParent().getSelectedContexts()[0].getObject().outboundDelivery;
            var item = "0000" + oEvent.getSource().getParent().getParent().getSelectedContexts()[0].getObject().outboundDeliveryItem;
            hu = hu.substr(hu.length-20);
            item = item.substr(item.length-6);
            outboundDelivery = outboundDelivery.substr(outboundDelivery.length-10);
            var extensionAPI = this.extensionAPI

            var oRemoveHU = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZSCM_PICKINGACTION_SRV");

            oRemoveHU.callFunction("/unassignHUFromDelivery", {
                method: "POST",
                urlParameters: {                    
                    deliveryNumber: outboundDelivery,
                    deliveryItem: item,
                    HU_EXID: hu
                },
                success: function(oData, oResponse) {
                    sap.m.MessageToast.show("HU removed", {
                        duration: 3000,                  // default
                        width: "15em",                   // default
                        my: "center bottom",             // default
                        at: "center bottom",             // default
                        of: window,                      // default
                        offset: "0 0",                   // default
                        collision: "fit fit",            // default
                        onClose: null,                   // default
                        autoClose: true,                 // default
                        animationTimingFunction: "ease", // default
                        animationDuration: 1000,         // default
                        closeOnBrowserNavigation: true   // default
                    });
                    extensionAPI.refresh("pickingapp.pickingapp::sap.suite.ui.generic.template.ObjectPage.view.Details::ZSCM_PickList_S1_L2--Container::responsiveTable-listUl");

                },
                error: function(oError) {
                    var sMsg = 'Unable to remove HU.';
                    sap.m.MessageToast.show(sMsg);
                }, 
            })
            extensionAPI.refresh("pickingapp.pickingapp::sap.suite.ui.generic.template.ObjectPage.view.Details::ZSCM_PickList_S1_L2--Container::responsiveTable-listUl");
        },

        removeHUPallet: function(oEvent) {
            var hu = "00000000000" + oEvent.getSource().getParent().getParent().getSelectedContexts()[0].getObject().HUNum;
            var outboundDelivery = "000000000" + oEvent.getSource().getParent().getParent().getSelectedContexts()[0].getObject().outboundDelivery;
            var item = "0000" + oEvent.getSource().getParent().getParent().getSelectedContexts()[0].getObject().outboundDeliveryItem;
            hu = hu.substr(hu.length-20);
            item = item.substr(item.length-6);
            outboundDelivery = outboundDelivery.substr(outboundDelivery.length-10);
            var extensionAPI = this.extensionAPI

            var oRemoveHU = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZSCM_PICKINGACTION_SRV");

            oRemoveHU.callFunction("/unassignHUFromDelivery", {
                method: "POST",
                urlParameters: {                    
                    deliveryNumber: outboundDelivery,
                    deliveryItem: item,
                    HU_EXID: hu
                },
                success: function(oData, oResponse) {
                    sap.m.MessageToast.show("HU removed", {
                        duration: 3000,                  // default
                        width: "15em",                   // default
                        my: "center bottom",             // default
                        at: "center bottom",             // default
                        of: window,                      // default
                        offset: "0 0",                   // default
                        collision: "fit fit",            // default
                        onClose: null,                   // default
                        autoClose: true,                 // default
                        animationTimingFunction: "ease", // default
                        animationDuration: 1000,         // default
                        closeOnBrowserNavigation: true   // default
                    });
                    extensionAPI.refresh("pickingapp.pickingapp::sap.suite.ui.generic.template.ObjectPage.view.Details::ZSCM_PickList_S1_L2--Pallet::responsiveTable-listUl");

                },
                error: function(oError) {
                    var sMsg = 'Unable to remove HU.';
                    sap.m.MessageToast.show(sMsg);
                }, 
            })
            extensionAPI.refresh("pickingapp.pickingapp::sap.suite.ui.generic.template.ObjectPage.view.Details::ZSCM_PickList_S1_L2--Pallet::responsiveTable-listUl");
        },

        updateSerialCont: function(oEvent) {
                var stat6 = oEvent.getSource().getParent().getParent().getBindingContext().getObject().stat6
                var stat7 = oEvent.getSource().getParent().getParent().getBindingContext().getObject().stat7
                var stat8 = oEvent.getSource().getParent().getParent().getBindingContext().getObject().stat8
                var stat9 = oEvent.getSource().getParent().getParent().getBindingContext().getObject().stat9
                var carrier = oEvent.getSource().getParent().getParent().getBindingContext().getObject().carrier
 //               var packMaterial = oEvent.getSource().getParent().getParent().getBindingContext().getObject().packMat;
                var packMaterial = oEvent.getSource().getParent().getParent().getSelectedContexts()[0].getObject().packMat;
                var plant = oEvent.getSource().getParent().getParent().getBindingContext().getObject().plant;
                var serialNumberList = []
                var hu = oEvent.getSource().getParent().getParent().getSelectedContexts()[0].getObject().HUNum;
                var HUleadingZeroes = "00000000000" + hu;
                var finalHU = HUleadingZeroes.substr(HUleadingZeroes.length-20);
                var oModelContainer = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZSCM_CONTAINER_EMPTY_SRV");
                var extensionAPI = this.extensionAPI

                oModelContainer.read("/ZSCM_CONTAINER_L4/?$filter=materialNumber eq \'" + packMaterial + "\'and manufacturer eq \'"+ carrier + "\'and plant eq \'" + plant + "\'", {
                    success: function(oData, oResponse) {
                        console.log(oData.results)
                        var payload = "{\"items\":["
                        for(let i=0; i<(oData.results.length); i++) {
                            var serial = oData.results[i].serialNumber;
                            if (serialNumberList.includes(serial) == false) {
                                serialNumberList.push(serial)
                            }
                        }
                        var count = 0
                        var count = 0
                        for(let i=0; i<serialNumberList.length; i++) {
                            var addToList = 0
                            var statComp = 0
                            var unuFlag = 0
                            var materialText = oData.results[i].materialText
                            var serialNumber = oData.results[i].serialNumber
                            var materialNumber = oData.results[i].materialNumber
                            var dayOwned = oData.results[i].dayOwned
                            var lastRecievedDate = oData.results[i].lastRecievedDate
                            var userStatustext = oData.results[i].userStatustext
                            var totalUserStat = ""

                            //check status of container matches customer status
                            if (stat6 != '' && stat6 != null && stat6 != 'FUM') {
                                statComp += 1
                            } else if (stat7 != '' && stat7 != null && stat7 != 'FUM') {
                                statComp += 1
                            } else if (stat8 != '' && stat8 != null && stat8 != 'FUM') {
                                statComp += 1
                            } else if (stat9 != '' && stat9 != null && stat9 != 'FUM') {
                                statComp += 1
                            }
                            
                            if (userStatustext != undefined) {
                                userStatustext = userStatustext.nodeValue
                            } else {
                                userStatustext = ""
                            }
                            serial = serialNumberList[i]
                            for(let j=0; j<(oData.results.length); j++){
                                if ((serial == oData.results[j].serialNumber && oData.results[j].userStatustext != undefined)) {
                                    totalUserStat += oData.results[i].userStatustext + " "
                                }
                            }
                            for (let j=0; j<4; j++) {
                                for(let k=0; k<(oData.results.length); k++){
                                    if (serial == oData.results[k].serialNumber) {
                                        var userStat = oData.results[k].userStatCode
                                        console.log("userStat:" + userStat)
                                        console.log("serial:" + serial)
                                        if (userStat != undefined) {
                                            userStat = userStat.nodeValue
                                        } else {
                                            userStat = ''
                                        }
                                        if(userStat == 'UNU') {
                                            unuFlag = 1
                                        }
                                        if (j == 0 && stat6 != '' && stat6 != null && stat6 != 'FUM') {
                                            if (stat6 == userStat) {
                                                addToList += 1
                                            }
                                        } else if (j == 1 && stat7 != '' && stat7 != null && stat7 != 'FUM') {
                                            if (stat7 == userStat) {
                                                addToList += 1
                                            }
                                        } else if (j == 2 && stat8 != '' && stat8 != null && stat8 != 'FUM') {
                                            if (stat8 == userStat) {
                                                addToList += 1
                                            }
                                        } else if (j == 3 && stat9 != '' && stat9 != null && stat9 != 'FUM') {
                                            if (stat9 == userStat) {
                                                addToList += 1
                                            }
                                        }
                                    }
                                }
                            }
                            if (stat6 == '' && stat7 == '' && stat8 == '' && stat9 == '') {
                                addToList = 1
                                statComp = 1
                            }
                            if (statComp == addToList && unuFlag != 1) {
                                if (count >= 1 ) {
                                    payload += ","
                                }
                                payload += "{\"materialText\":\"" + materialText + "\",\"serialNumber\":\"" + serial + "\",\"materialNumber\":\"" + materialNumber + 
                                "\",\"dayOwned\":\"" + dayOwned + "\",\"lastRecievedDate\":\"" + lastRecievedDate + "\",\"userStatustext\":\"" + 
                                totalUserStat + "\"}"
                                count += 1
                            }
                        }
                        payload += "]}"
                        var fnDoSearch = function (oEvent, bProductSearch) {
                            var aFilters = [],
                                    sSearchValue = oEvent.getParameter("value"),
                                    itemsBinding = oEvent.getParameter("itemsBinding");
                
                            // create the local filter to apply
                            if(sSearchValue !== undefined && sSearchValue.length > 0) {
                                if(bProductSearch) {
                                    // create multi-field filter to allow search over all attributes
                                    aFilters.push(new sap.ui.model.Filter("ProductId", sap.ui.model.FilterOperator.Contains , sSearchValue));
                                    // apply the filter to the bound items, and the Select Dialog will update
                                    itemsBinding.filter(aFilters, "Application");
                                } else {
                                    // create multi-field filter to allow search over all attributes
                                    aFilters.push(new sap.ui.model.Filter("materialNumber", sap.ui.model.FilterOperator.Contains , sSearchValue));
                                    aFilters.push(new sap.ui.model.Filter("materialText", sap.ui.model.FilterOperator.Contains , sSearchValue));
                                    aFilters.push(new sap.ui.model.Filter("serialNumber", sap.ui.model.FilterOperator.Contains , sSearchValue));
                                    aFilters.push(new sap.ui.model.Filter("userStatustext", sap.ui.model.FilterOperator.Contains , sSearchValue));
                                    aFilters.push(new sap.ui.model.Filter("lastRecievedDate", sap.ui.model.FilterOperator.Contains , sSearchValue));
                                    aFilters.push(new sap.ui.model.Filter("dayOwned", sap.ui.model.FilterOperator.Contains , sSearchValue));

                                    // apply the filter to the bound items, and the Select Dialog will update
                                    itemsBinding.filter(new sap.ui.model.Filter(aFilters, false), "Application"); // filters connected with OR
                                }
                            } else {
                                // filter with empty array to reset filters
                                itemsBinding.filter(aFilters, "Application");
                            }
                        };
                
                        // filter function for the product search
                        var fnDoProductSearch = function (oEvent) {
                            fnDoSearch(oEvent, true);
                        };
                
                        // filter function to align the binding with the search term
                        var fnCreatePrefilter = function (sSearchValue, bProductSearch) {
                            var aFilters = [];
                
                            // create the local filter to apply
                            if(sSearchValue !== undefined) {
                                aFilters.push(new sap.ui.model.Filter((bProductSearch ? "ProductId" : "serialNumber" ), sap.ui.model.FilterOperator.Contains , sSearchValue));
                            }
                            return aFilters;
                        };
                
                        var fnPrefilterDialog = function (sSearchValue){
                            // create an array to hold the filters we create
                            var aFilters = fnCreatePrefilter(sSearchValue),
                                    itemsBinding = oTableSelectDialog1.getBinding("items");
                
                            itemsBinding.filter(aFilters, "Application");
                        };
                
                        /* dialog data */
                        var oDialogData = {
                            title: "Please Select a Container",
                            noDataMessage: "Sorry, No Containers Available"
                        };
                
                        var oModelDialog = new sap.ui.model.json.JSONModel();
                        oModelDialog.setData(oDialogData);
                
                            // create the data to be shown in the table
                        var oProductData1 = JSON.parse(payload)
                        console.log(oProductData1)
                        // create the model to hold the data
                        var oModel1 = new sap.ui.model.json.JSONModel();
                        oModel1.setDefaultBindingMode("OneWay");
                        oModel1.setData(oProductData1);
                        
                        var fnCreateSimpleDialogColumns = function () {
                            return [
                                new sap.m.Column({
                                    hAlign: "Begin",
                                    header: new sap.m.Label({
                                        text: "Packaging Material",
                                        wrapping: true
                                    })
                                }),
                                new sap.m.Column({
                                    hAlign: "Begin",
                                    popinDisplay: "Inline",
                                    header: new sap.m.Label({
                                        text: "Container Description",
                                        wrapping: true
                                    }),
                                    minScreenWidth: "Tablet",
                                    demandPopin: true
                                }),
                                new sap.m.Column({
                                    hAlign: "Begin",
                                    popinDisplay: "Inline",
                                    header: new sap.m.Label({
                                        text: "Serial Number",
                                        wrapping: true
                                    }),
                                    minScreenWidth: "Tablet",
                                    demandPopin: true
                                }),
                                new sap.m.Column({
                                    hAlign: "Begin",
                                    header: new sap.m.Label({
                                        text: "User Status",
                                        wrapping: true
                                    }),
                                    minScreenWidth: "Tablet",
                                    demandPopin: true
                                }),
                                new sap.m.Column({
                                    hAlign: "Begin",
                                    popinDisplay: "Inline",
                                    header: new sap.m.Label({
                                        text: "Container Latest Received date",
                                        wrapping: true
                                    }),
                                    minScreenWidth: "Tablet",
                                    demandPopin: true
                                }),
                                new sap.m.Column({
                                    hAlign: "Begin",
                                    header: new sap.m.Label({
                                        text: "Amount of day in Manildra ownership",
                                        wrapping: true
                                    }),
                                    minScreenWidth: "Tablet",
                                    demandPopin: true
                                })]
                            };
                
                        // create our new Table Select Dialog
                        var oTableSelectDialog1 = new sap.m.TableSelectDialog("TableSelectDialog1", {
                            title: "{dialog>/title}",
                            noDataText: "{dialog>/noDataMessage}",
                            search : fnDoSearch,
                            liveChange: fnDoSearch,
                            columns : [
                                fnCreateSimpleDialogColumns()
                            ]
                        });
                
                        // create the template for the items binding
                        var oItemTemplate1 = new sap.m.ColumnListItem({
                            type : "Active",
                            unread : false,
                            cells : [
                                new sap.m.Label({
                                    text : "{materialNumber}",
                                    wrapping: true
                                }), new sap.m.Label({
                                    text: "{materialText}",
                                    wrapping: true
                                }), new sap.m.Label({
                                    text: "{serialNumber}",
                                    wrapping: true
                                }), new sap.m.Label({
                                    text: "{userStatustext}",
                                    wrapping: true
                                }), new sap.m.Label({
                                    text: "{lastRecievedDate}",
                                    wrapping: true
                                }), new sap.m.Label({
                                    text: "{dayOwned}",
                                    wrapping: true
                                })
                            ]
                        });
                    
                        // attach confirm listener
                        oTableSelectDialog1.attachCancel(function (evt) {
                                //oTableSelectDialog1.destroy();
                                cancel = 1
                            
                        });
                        var input1 = new sap.m.Input("Input1",{
                            maxLength: 20,
                            showValueHelp: true,
                            id: "Container"
                        });

                        var oButton3 = new sap.m.Button("Cancel", {
                            text: "Cancel"
                        });

                        var oButton2 = new sap.m.Button("OK", {
                            text: "OK"
                        });

                        oButton3.attachPress(function (evt) {
                            oDialog.close();
                            oDialog.destroy();
                            oTableSelectDialog1.destroy();
                        });

                        oButton2.attachPress(function (evt) {
                            var serial = sap.ui.getCore().byId("Input1").getValue()
                            console.log(serial)
                            if (serial != '') {
                                var oUpdateSerialNum = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZSCM_PICKINGACTION_SRV");

                                oUpdateSerialNum.callFunction("/updateSerialNumber", {
                                    method: "POST",
                                    urlParameters: {                    
                                        serialNumber: serial,
                                        HU_EXID: finalHU
                                    },
                                    success: function(oData, oResponse) {
                                        console.log(oData)
                                        extensionAPI.refresh("pickingapp.pickingapp::sap.suite.ui.generic.template.ObjectPage.view.Details::ZSCM_PickList_S1_L2--Container::Table");
                                        sap.m.MessageToast.show("Serial Updated"); 
                                        oDialog.close();
                                        oDialog.destroy();
                                        oTableSelectDialog1.destroy();
                                    },
                                    error: function(oError) {
                                        sap.m.MessageToast.show('Unable to Update Serial');   
                                        oDialog.close();
                                        oDialog.destroy();
                                        oTableSelectDialog1.destroy();
                                    }
                                })
                            } else {
                                oDialog.close();
                                oDialog.destroy();
                                oTableSelectDialog1.destroy();
                            }
                        })

                        var oDialog = new sap.m.Dialog("Dialog1",{
                            title:"Select Container Details",
                            contentWidth:"40%",
                            closeOnNavigation: true,
                            buttons: [oButton2, oButton3],
                            content:[
                                new sap.m.Label({text:"Select Container"}),
                                input1,
                            ]
                        });

                        oDialog.addStyleClass("sapUiContentPadding");

                        input1.attachValueHelpRequest(function (evt) {
                            oTableSelectDialog1.open();
                            oTableSelectDialog1.bindAggregation("items", "/items", oItemTemplate1);
                            oTableSelectDialog1.setModel(oModel1);
                        });

                        oTableSelectDialog1.attachConfirm(function (evt) {
                            
                            var selectedItem = evt.getParameter("selectedItem");
                            if (selectedItem) {
                                //Get all the cells and pull back the first one which will be the name content
                                var oCells = selectedItem.getCells();
                                var oCell = oCells[2];
                                //Now update the input with the value
                                serialNumber = oCell.getText()
                                //oTableSelectDialog1.destroy();
                                sap.ui.getCore().byId("Input1").setValue(oCell.getText())
                                console.log(sap.ui.getCore().byId("Input1"))
                            }
                        });

                        oDialog.open();
                    },
                    error: function(oError) {
                        sap.m.MessageToast.show('Unable to Update Serial');   
                    }
                });

        },

        addBatchBakery: function(oEvent) {
            var transportOrder = oEvent.getSource().getParent().getParent().getBindingContext().getObject().transportOrder;
            var material = "000000000000" + oEvent.getSource().getParent().getParent().getSelectedContexts()[0].getObject().material;
            material = material.substr(material.length-18);
            var totalQaunt = oEvent.getSource().getParent().getParent().getSelectedContexts()[0].getObject().quant
            var batch;
            var qty;
            var extensionAPI = this.extensionAPI

            var oButton2 = new sap.m.Button("Cancel", {
                text: "Cancel"
            });

            var oButton1 = new sap.m.Button("OK", {
                text: "OK"
            });

            var oButton3 = new sap.m.Button("Cancel2", {
                text: "Cancel"
            });

            var oButton4 = new sap.m.Button("Continue", {
                text: "Continue"
            });

            oButton3.attachPress(function (evt) {
                sap.ui.getCore().byId("Dialog2").close();
                sap.ui.getCore().byId("Dialog2").destroy();
                sap.ui.getCore().byId("Dialog1").close();
                sap.ui.getCore().byId("Dialog1").destroy();
            });

            oButton4.attachPress(function (evt) {
                var returnMessage = ""
                var oBakeryList = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZSCM_PICKINGAPP_SRV");

                oBakeryList.read("/ZSCM_I_Bakery_ODPickList_L2?$filter=transportOrder eq \'" + transportOrder + "\' and material eq \'" + material + "\'", {
                    success: function(oData, oResponse) {
                        var stopFlag = qty;
                        for(let i=0; i<(oData.results.length); i++) {
                            var outboundDelivery = "000000000" + oData.results[i].outboundDelivery
                            outboundDelivery = outboundDelivery.substr(outboundDelivery.length-10);
                            var item = "0000" + oData.results[i].item
                            item = item.substr(item.length-6);
                            var uom = oData.results[i].uom
                            var quant = parseInt(oData.results[i].quant)
                            var pickQaunt = parseInt(oData.results[i].pickedQuantBatch)
                            var leftToPick = quant-pickQaunt;
                            var setPick = 0
                            var setQuant = 0
                            var temp = parseInt(stopFlag,10);
                            if (leftToPick < temp) {
                                setQuant = leftToPick
                            } else {
                                setQuant = temp
                            }
                            stopFlag = parseInt(stopFlag,10) - quant;
                            if (stopFlag < 0 ) {
                                var setPick = pickQaunt + setQuant;
                                var oAssignBatch = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/API_OUTBOUND_DELIVERY_SRV;v=2");

                                oAssignBatch.callFunction("/PickAndBatchSplitOneItem", {
                                    method: "POST",
                                    urlParameters: {                    
                                        DeliveryDocument: outboundDelivery,
                                        DeliveryDocumentItem: item,
                                        SplitQuantity: setPick, 
                                        SplitQuantityUnit: uom,
                                        Batch: batch
                                    },
                                    success: function(oData, oResponse) {
                                                //console.log(data);
                                        returnMessage = returnMessage + " delivery " + outboundDelivery + " was short picked. Please select another batch. "
                                        extensionAPI.refresh("pickingapp.pickingapp::sap.suite.ui.generic.template.ObjectPage.view.Details::ZSCM_PickList_S2_L1--BulkProd::Table");
                                        extensionAPI.refresh("pickingapp.pickingapp::sap.suite.ui.generic.template.ObjectPage.view.Details::ZSCM_C_PICKINGAPP--ScenarioNoHU::Table");
                                                
                                    },
                                    error: function () {     
                                        //console.log(data)
                                        var sMsg = 'Unable to assign Batch.'
                                        sap.m.MessageBox.error(sMsg);
                                    }
                                })
                                break;
                            } else {
                                var setPick = pickQaunt + quant;
                                var oAssignBatch = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/API_OUTBOUND_DELIVERY_SRV;v=2");

                                oAssignBatch.callFunction("/PickAndBatchSplitOneItem", {
                                    method: "POST",
                                    urlParameters: {                    
                                        DeliveryDocument: outboundDelivery,
                                        DeliveryDocumentItem: item,
                                        SplitQuantity: setPick, 
                                        SplitQuantityUnit: uom,
                                        Batch: batch
                                    },
                                    success: function(oData, oResponse) {
                                                //console.log(data);
                                        returnMessage = returnMessage + " delivery " + outboundDelivery + " was short picked. Please select another batch. "
                                        extensionAPI.refresh("pickingapp.pickingapp::sap.suite.ui.generic.template.ObjectPage.view.Details::ZSCM_PickList_S2_L1--BulkProd::Table")
                                        extensionAPI.refresh("pickingapp.pickingapp::sap.suite.ui.generic.template.ObjectPage.view.Details::ZSCM_C_PICKINGAPP--ScenarioNoHU::Table")
                                                
                                    },
                                    error: function () {     
                                        //console.log(data)
                                        var sMsg = 'Unable to assign Batch.'
                                        sap.m.MessageBox.error(sMsg);
                                    }
                                })
                            }
                            
                        }
                        sap.m.MessageToast.show(returnMessage);
                    
                    },
                    error: function (oError) { 
                        console.log(oError)
                        sap.m.MessageBox.error(oError);
                    }, 
                    
                })
            
                sap.ui.getCore().byId("Dialog1").close();
                sap.ui.getCore().byId("Dialog1").destroy();
                sap.ui.getCore().byId("Dialog2").close();
                sap.ui.getCore().byId("Dialog2").destroy();
            });

            oButton2.attachPress(function (evt) {
                sap.ui.getCore().byId("Dialog1").close();
                sap.ui.getCore().byId("Dialog1").destroy();
                sap.ui.getCore().byId("Dialog2").close();
                sap.ui.getCore().byId("Dialog2").destroy();
            });

            oButton1.attachPress(function (evt) {
                qty = sap.ui.getCore().byId("Qty").getValue()
                batch = sap.ui.getCore().byId("Batch").getValue()
                var obatchCheck = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZSCM_PICKINGAPP_SRV");
                obatchCheck.read("/ZSCM_I_ValidBatch?$filter=Matnr eq \'" + material + "\' and Werks eq \'" + plant + "\' and Charg eq \'" + batch + "\'", {
                    success: function(oData, oResponse) {
                        if (oData.results.length > 0) {
                            if (qty == "") {
                                sap.m.MessageToast.show("Please Enter Qty");
                            } else {
                                sap.ui.getCore().byId("Dialog1").close();
                                sap.ui.getCore().byId("Dialog1").destroy();
                                sap.ui.getCore().byId("Dialog2").destroy();
                                if (qty < parseInt(totalQaunt, 10)) {
                                    oDialog2.open() 
                                } else {
                                    var oBakeryList = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZSCM_PICKINGAPP_SRV");

                                    oBakeryList.read("/ZSCM_I_Bakery_ODPickList_L2?$filter=transportOrder eq \'" + transportOrder + "\' and material eq \'" + material + "\'", {
                                        success: function(oData, oResponse) {
                                            for(let i=0; i<(oData.results.length); i++) {
                                                var outboundDelivery = "000000000" + oData.results[i].outboundDelivery
                                                outboundDelivery = outboundDelivery.substr(outboundDelivery.length-10);
                                                var item = "0000" + oData.results[i].item
                                                item = item.substr(item.length-6);
                                                var uom = oData.results[i].uom
                                                var quant = parseInt(oData.results[i].quant,10);
                                                var oAssignBatch = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/API_OUTBOUND_DELIVERY_SRV;v=2");

                                                oAssignBatch.callFunction("/PickAndBatchSplitOneItem", {
                                                    method: "POST",
                                                    urlParameters: {                    
                                                        DeliveryDocument: outboundDelivery,
                                                        DeliveryDocumentItem: item,
                                                        SplitQuantity: quant, 
                                                        SplitQuantityUnit: uom,
                                                        Batch: batch
                                                    },
                                                    success: function(oData, oResponse) {
                                                        //console.log(data);
                                                        sap.m.MessageToast.show("Batch " + batch + " added to delivery " + outboundDelivery, {
                                                            duration: 3000,                  // default
                                                            width: "15em",                   // default
                                                            my: "center bottom",             // default
                                                            at: "center bottom",             // default
                                                            of: window,                      // default
                                                            offset: "0 0",                   // default
                                                            collision: "fit fit",            // default
                                                            onClose: null,                   // default
                                                            autoClose: true,                 // default
                                                            animationTimingFunction: "ease", // default
                                                            animationDuration: 1000,         // default
                                                            closeOnBrowserNavigation: true   // default
                                                        });                                                        
                                                        extensionAPI.refresh("pickingapp.pickingapp::sap.suite.ui.generic.template.ObjectPage.view.Details::ZSCM_PickList_S2_L1--BulkProd::Table");
                                                        extensionAPI.refresh("pickingapp.pickingapp::sap.suite.ui.generic.template.ObjectPage.view.Details::ZSCM_C_PICKINGAPP--ScenarioNoHU::Table");
                                                                
                                                    },
                                                    error: function () {     
                                                        //console.log(data)
                                                        var sMsg = 'Unable to assign Batch.'
                                                        sap.m.MessageBox.error(sMsg);
                                                    }
                                                })
                                            }
                                        },
                                        error: function (oError) { 
                                            console.log(oError)        
                                        }
                                    }) 
                                }
                                extensionAPI.refresh("pickingapp.pickingapp::sap.suite.ui.generic.template.ObjectPage.view.Details::ZSCM_I_Bakery_L2--PickList::Table");
                            }
                        } else {
                            var sMsg = 'Invalid Batch.'
                            sap.m.MessageBox.error(sMsg);
                            sap.ui.getCore().byId("Dialog1").close();
                            sap.ui.getCore().byId("Dialog1").destroy();
                        }
                    },
                    error: function (data) { 
                        console.log(data)        
                    }  
                });            
            });

            var oDialog = new sap.m.Dialog("Dialog1",{
                title:"Scan Batch and Enter Quantity",
                contentWidth:"20%",
                closeOnNavigation: true,
                buttons: [oButton1, oButton2],
                content:[
                    new sap.m.Label({text:"Qty:", required: true}),
                    new sap.m.Input({maxLength: 20, id: "Qty", type: "Number"}),
                    new sap.m.Label({text:"Batch:", required: true}),
                    new sap.m.Input({maxLength: 20, id: "Batch"})
                ]
            });

            var oDialog2 = new sap.m.Dialog("Dialog2",{
                title:"Warning",
                state: sap.ui.core.ValueState.Warning,
                content: [
                    new sap.m.Text({ text: "You have short picked the material. If you plan to split batch continue otherwise cancel and amend delivery." })
                ],
                contentWidth:"20%",
                closeOnNavigation: true,
                buttons: [oButton3, oButton4]
            });

            oDialog.addStyleClass("sapUiContentPadding");
            oDialog.open()

        }
        
    };
});

function onContinueAddHU(oEvent, finalHU, item, material, uom, outboundDelivery, extensionAPI) {

    var oModelCreateHU = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZSCM_PICKINGACTION_SRV");

    oModelCreateHU.callFunction("/assignHUToDelivery", {
        method: "POST",
        urlParameters: {                    
            deliveryNumber: outboundDelivery,
            deliveryItem: item,
            HU_EXID: finalHU, 
            material: material,
            picked: '0',
            batch: '', 
            uom: uom,
        },
        success: function(oData, oResponse) {
            console.log(oData)
            var message = oData.Message
            var messageType = oData.Type
            if (messageType == 'S') {
                console.log(message)
                sap.m.MessageToast.show(message);
                extensionAPI.refresh("pickingapp.pickingapp::sap.suite.ui.generic.template.ObjectPage.view.Details::ZSCM_C_PICKINGAPP--ScenarioHU::Table");
                extensionAPI.refresh("pickingapp.pickingapp::sap.suite.ui.generic.template.ObjectPage.view.Details::ZSCM_PickList_S1_L2--Pallet::Table");
            } else {
                sap.m.MessageBox.error(message);
            }  
        },
        error: function(oError) {
            console.log(oError)
            sap.m.MessageBox.error(oError);
        }, 
    })

}