const https = require('node:https');

const AppSettingsModel = require('../../cardad-db/settingsSchema');

const { CarMakeModel, CarModelModel } = require('../../cardad-db/cardadSchema');

function updateMakeModel(){
return new Promise((res, rej) => 
{
    AppSettingsModel.findOne({name: "NHTSA Api"}).exec().then((appSettings) => 
    {

          https.get(appSettings.apiSettings.baseUrl + '/vehicles/GetMakesForVehicleType/car?format=json', (res) => {
            console.log('statusCode:', res.statusCode);
            console.log('headers:', res.headers);
            var body = '';
            res.on('data', (d) => {
              body += d;
            });
            res.on('end', function()
            {
              var makesResponse = JSON.parse(body);
              CarMakeModel.find({ makeId: { $in: makesResponse.Results.map(m => m.MakeId) }}).exec().then((data) => 
              {
                return data;
              }).then((existingRecords) => 
              {
                if(Array.isArray(existingRecords)){
                  var newRecords = makesResponse.Results.filter(make => !existingRecords.map(m => m.MakeId).includes(make.MakeId))
                  .map((filtered) => { return { makeId: filtered.MakeId, makeName: filtered.MakeName, vehicleTypeId: filtered.VehicleTypeId, vehicleTypeName: filtered.VehicleTypeName } });

                  CarMakeModel.insertMany(newRecords).then(records => 
                    {
                      console.log(records.length.toString() + ' records inserted');
                    })
                }
                
              });
              
            });
          }).on('error', (e) => {
            console.error(e);
          });
    }).catch((err) => 
    {
        console.log(err);
    });
});
}

module.exports = updateMakeModel;