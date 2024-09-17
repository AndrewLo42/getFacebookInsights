
async function getFormName(form_id) {
    let access_token = 'EAAR4CJz7JOsBOZCVBPlYBZArhoH1I2vU0kJvoiKaoGvz6lsbbM9jvCeLb2I3O3vLozEHVKITA4Hb69XxeszXgFmvV0BZCTaYvZAURZCtTf9lVZAWQvojDvHbiypABVfmX57fPEJgncmLZCPDSoGq5q2qXvQ2N7FQENKPtpl1richf4fJhpgZAcjL7hk14yzJDl30';
    let url = 'https://graph.facebook.com/v20.0/'
      + form_id
      + '?access_token=' + access_token
      let response = fetch(url);
      return response.then(res => {
        return res.json();
      }).then((data) => {
        return data.name;
      });
}

async function pageLeads(entity_id, entity_name, access_key, acc_id, acc_name) {
    console.log('keys', entity_name, entity_id, access_key)
    let access_token = access_key;
    let url = 'https://graph.facebook.com/v20.0/'
    + entity_id
    + '?fields=leadgen_forms{leads{campaign_name,ad_id,ad_name,created_time,is_organic,partner_name,id,platform,form_id,campaign_id,field_data},created_time,id}'
    + '&access_token=' + access_token;
    const response = fetch(url);
    return response.then(res => {
        return res.json();
    }).then(async (leadData) => {
        let allLeads = [];
        let toPass = [];
        if(leadData['leadgen_forms']['data']) {
            let leadForms = leadData['leadgen_forms']['data'][0]['leads']['data'];
            for (let i = 0; i < leadForms.length; i++) {
                    let leadInfo = {};
                    //loop through field data for information we need
                    for(let j = 0; j < leadForms[i]['field_data'].length; j++) {
                        if (leadForms[i]['field_data'][j]['name'] === 'full_name') {
                            leadInfo['name'] = leadForms[i]['field_data'][j]['values'][0]
                        } else if (leadForms[i]['field_data'][j]['name'] === 'email') {
                            leadInfo['email'] = leadForms[i]['field_data'][j]['values'][0]
                        } else if (leadForms[i]['field_data'][j]['name'] === 'phone_number') {
                            leadInfo['phone'] = leadForms[i]['field_data'][j]['values'][0]
                        }
                    }
                    leadInfo['created'] = leadForms[i]['created_time'].split("+")[0];
                    leadInfo['source'] = leadForms[i]['is_organic'] ? "direct" : "paid";
                    leadInfo['lead_id'] = leadForms[i]['id'];
                    leadInfo['account_id'] = acc_id.split('_')[1];
                    leadInfo['account_name'] = acc_name;
                    leadInfo['ad_id'] = leadForms[i]['ad_id'];
                    leadInfo['campaign_id'] = leadForms[i]['campaign_id'];
                    leadInfo['platform'] = leadForms[i]['platform'];
                    leadInfo['form'] = await getFormName(leadForms[i]['form_id']);
                    leadInfo['page_id'] = entity_id;
                    leadInfo['page_name'] = entity_name;
                    allLeads.push(leadInfo);
                    toPass.push({
                        'lead_id': leadInfo.lead_id,
                        'account_id': leadInfo.account_id,
                        'account_name': acc_name,
                        'ad_id': leadInfo.ad_id,
                        'campaign_id': leadInfo.campaign_id,
                        'form_id': leadForms[i]['form_id'],
                    });
            }
        } else {
            console.log('No leads')
            return [];
        }
        return [allLeads, toPass]
    }).catch(err => {
        console.error(err)
    })
}

async function getLeads(accounts, acc_id, acc_name) {
    console.log(accounts)
    let leads = [];
    let toPass = [];
    try {
        for (let i = 0; i < accounts.length; i++) {
            let newLeads = await pageLeads(accounts[i].id, accounts[i].name, accounts[i].access_token, acc_id, acc_name);
            leads = leads.concat(newLeads[0]);
            toPass = leads.concat(newLeads[1]);
        }
    } catch (err) {
        console.error(err)
    } finally {
        return [leads, toPass];
    }
}

module.exports = { getLeads }