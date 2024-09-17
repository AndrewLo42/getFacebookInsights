const sql = require('mssql');
const { getViews, getAccountInfo } = require('./retrieveViews');
const { getLeads } = require('./retrieveLeads');
require('dotenv').config();

function InsightSQLUpload(stats, poolConnection) {
    console.log('To Upload', stats)
    let sqlLine = `
    IF EXISTS (
     SELECT 1
     FROM Insights
     WHERE
         account_id = @account_id AND
         date_start = @date_start AND
         date_stop = @date_stop AND
         platform = @platform
    )
    BEGIN
        UPDATE Insights
        SET
            account_id = @account_id,
            account_name = @account_name,
            reach = @reach,
            impressions = @impressions,
            clicks = @clicks,
            cpc = @cpc,
            spend = @spend,
            account_currency = @account_currency,
            date_start = @date_start,
            date_stop = @date_stop,
            platform = @platform,
            views = @views
        WHERE
            account_id = @account_id AND
            date_start = @date_start AND
            date_stop = @date_stop AND
            platform = @platform
    END
    ELSE
    BEGIN
        INSERT INTO Insights (account_id, account_name, reach, impressions, clicks, cpc, spend, account_currency, date_start, date_stop, platform, views)
        VALUES (@account_id, @account_name, @reach, @impressions, @clicks, @cpc, @spend, @account_currency, @date_start, @date_stop, @platform, @views)
    END
    `
 //  Upload  to SQL server
    poolConnection.request()
     .input('account_id', sql.VarChar, stats.account_id)
     .input('account_name', sql.VarChar, stats.account_name)
     .input('reach', sql.Int, stats.reach)
     .input('impressions', sql.Int, stats.impressions)
     .input('clicks', sql.Int, stats.clicks)
     .input('cpc', sql.Float, stats.cpc)
     .input('spend', sql.Money, stats.spend)
     .input('account_currency', sql.VarChar, stats.account_currency)
     .input('date_start', sql.DateTime, stats.date_start)
     .input('date_stop', sql.DateTime, stats.date_stop)
     .input('platform', sql.VarChar, stats.publisher_platform)
     .input('views', sql.Int, stats.views)
     .query(`${sqlLine}`);
}

function LeadsSQLUpload(stats, poolConnection) {
    console.log('To Upload', stats)
    let sqlLine = `
    IF EXISTS (
     SELECT 1
     FROM Leads
     WHERE
        LeadsID = @lead_id AND
        account_id = @account_id
    )
    BEGIN
        UPDATE Leads
        SET
            LeadsID = @lead_id,
            Created = @created,
            Name = @name,
            Email = @email,
            Source = @source,
            Form = @form,
            Phone = @phone,
            account_id = @account_id,
            campaign_id = @campaign_id,
            ad_id = @ad_id,
            platform = @platform,
            account_name = @account_name,
            page_id = @page_id,
            page_name = @page_name
        WHERE
            LeadsID = @lead_id
    END
    ELSE
    BEGIN
        INSERT INTO Leads (LeadsID, Created, Name, Email, Source, Form, Phone, account_id, campaign_id, ad_id, platform, account_name, page_id, page_name)
        VALUES (@lead_id, @created, @name, @email, @source, @form, @phone, @account_id, @campaign_id, @ad_id, @platform, @account_name, @page_id, @page_name)
    END
    `
 //  Upload  to SQL server
    poolConnection.request()
     .input('lead_id', sql.VarChar, stats.lead_id)
     .input('created', sql.VarChar, stats.created)
     .input('name', sql.VarChar, stats.name)
     .input('email', sql.VarChar, stats.email)
     .input('source', sql.VarChar, stats.source)
     .input('form', sql.VarChar, stats.form)
     .input('phone', sql.VarChar, stats.phone)
     .input('account_id', sql.VarChar, stats.account_id)
     .input('campaign_id', sql.VarChar, stats.campaign_id)
     .input('ad_id', sql.VarChar, stats.ad_id)
     .input('platform', sql.VarChar, stats.platform)
     .input('account_name', sql.VarChar, stats.account_name)
     .input('page_id', sql.VarChar, stats.page_id)
     .input('page_name', sql.VarChar, stats.page_name)
     .query(`${sqlLine}`);
}

function ParentsSQLUpload(data, poolConnection) {
    console.log('To Upload', data);
    let sqlLine = `
    IF NOT EXISTS (
        SELECT 1
        FROM Leads_Parents
        WHERE
            lead_id = @lead_id AND
            account_id = @account_id AND
            account_name = @account_name AND
            campaign_id = @campaign_id AND
            form_id = @form_id AND
            ad_id = @ad_id
    )
    BEGIN
        INSERT INTO Leads_Parents (lead_id, account_id, account_name, campaign_id, form_id, ad_id)
        VALUES (@lead_id, @account_id, @account_name, @campaign_id, @form_id, @ad_id)
    END
    `
    poolConnection.request()
    .input('lead_id', sql.VarChar, data.lead_id)
    .input('account_id', sql.VarChar, data.account_id)
    .input('account_name', sql.VarChar, data.account_name)
    .input('campaign_id', sql.VarChar, data.campaign_id)
    .input('form_id', sql.VarChar, data.form_id)
    .input('ad_id', sql.VarChar, data.ad_id)
    .query(`${sqlLine}`);
}

function CampaignInsightsSQLUpload(data, poolConnection) {
    console.log('To Upload', data);
    let sqlLine = `
    IF EXISTS (
        SELECT 1
        FROM Campaigns
        WHERE
            campaign_id = @campaign_id AND
            date_start = @date_start AND
            date_stop = @date_stop
       )
       BEGIN
           UPDATE Campaigns
           SET
               account_id = @account_id,
               campaign_id = @campaign_id,
               campaign_name = @campaign_name,
               reach = @reach,
               impressions = @impressions,
               cost_per_result = @cost_per_result,
               spend = @spend,
               results = @results,
               action_type = @action_type,
               date_start = @date_start,
               date_stop = @date_stop
           WHERE
               campaign_id = @campaign_id AND
               date_start = @date_start AND
               date_stop = @date_stop
       END
       ELSE
       BEGIN
           INSERT INTO Campaigns (account_id, campaign_id, campaign_name, reach, impressions, cost_per_result, spend, results, action_type, date_start, date_stop)
           VALUES (@account_id, @campaign_id, @campaign_name, @reach, @impressions, @cost_per_result, @spend, @results, @action_type, @date_start, @date_stop)
       END
    `
    poolConnection.request()
    .input('account_id', sql.VarChar, data.account_id)
    .input('campaign_id', sql.VarChar, data.campaign_id)
    .input('campaign_name', sql.VarChar, data.campaign_name)
    .input('reach', sql.Int, data.reach)
    .input('impressions', sql.Int, data.impressions)
    .input('cost_per_result', sql.Float, data.cost_per_result)
    .input('results', sql.Int, data.results)
    .input('spend', sql.Money, data.spend)
    .input('action_type', sql.VarChar, data.action_type)
    .input('date_start', sql.DateTime, data.date_start)
    .input('date_stop', sql.DateTime, data.date_stop)
    .query(`${sqlLine}`);
}

function getCampaignInsights(entity_id, account_id, poolConnection) {
    let access_token = process.env.ACESS_KEY;
    let url = 'https://graph.facebook.com/v20.0/'
    //entity_id should be a campaign_id
      + entity_id
      + '/insights'
      + '?fields=spend,cost_per_action_type,impressions,reach,campaign_name,actions,clicks,cpc,ctr,cpm,cpp'
      + '&date_preset=last_month'
      + '&access_token=' + access_token
      let response = fetch(url);
      response.then(res => {
          return res.json();
      })
      .then(data => {
        //   console.log(data);
        let cpr = data['data'][0]['cost_per_action_type'].find(action => {
            if (action.action_type === "onsite_conversion.lead_grouped") {
                return action
            } else if (action.action_type === "link_click") {
                return action
            } else {
                return null;
            }
        });
        let action = data['data'][0].actions.find(action => {
            if (action.action_type === "onsite_conversion.lead_grouped") {
                return action
            } else if (action.action_type === "link_click") {
                return action
            } else {
                return null;
            }
        });
        let toUpload = {
            account_id: account_id,
            campaign_id: entity_id,
            campaign_name: data['data'][0].campaign_name,
            reach: data['data'][0].reach,
            impressions: data['data'][0].impressions,
            cost_per_result: cpr.value,
            results: action.value,
            action_type: action.action_type,
            spend: data['data'][0].spend,
            date_start: data['data'][0].date_start,
            date_stop: data['data'][0].date_stop
        };
        // console.log('to upload campaign', toUpload)

        // Campaign Insights SQL statements
        CampaignInsightsSQLUpload(toUpload, poolConnection);
        })
        .catch((err) => {
            console.error(err);
        })
}

function getAccountCampaigns(entity_id, poolConnection) {
    let access_token = process.env.ACESS_KEY;
    let url = 'https://graph.facebook.com/v20.0/'
      + entity_id
      + '/campaigns'
      + '?access_token=' + access_token
      let response = fetch(url);
      return response.then(res => {
        return res.json();
      }).then((data) => {
        const parsedData = data['data'];
        let campaigns = []
        for (let i = 0; i < parsedData.length; i++) {
            campaigns.push(parsedData[i].id)
        }
        return campaigns;
      }).catch((err) => {
        console.error(err);
      })
}

function FBInsights(entity_id, entity_name, all_account_info, poolConnection) {
    let access_token = process.env.ACESS_KEY;
    let url = 'https://graph.facebook.com/v20.0/'
      + entity_id
      + '/insights'
      + '?&date_preset=last_month'
      + '&time_increment=1'
      + '&fields=account_id,account_name,campaign_id,campaign_name,reach,impressions,clicks,cpc,spend,account_currency'
      + '&breakdowns= publisher_platform'
      + '&access_token=' + access_token
// + '&limit=999'
    let response = fetch(url);
    response.then(res => {
        return res.json();
    }).then(async data => {
        // Handle insights pagination, remove this promise chain if no pagination needed
        let insights = {}
        insights['data'] = data['data'];
        if (data['paging']['next']) {
            insights['next'] = data['paging']['next']
        }
        while (insights['next']) {
            let nextData = await getNextPage(insights['next']);
            insights['data'] = insights['data'].concat(nextData['data']);
            if(nextData['paging']['next']) {
                insights['next'] = nextData['paging']['next'];
            } else {
                insights['next'] = false;
            }
        }
        return insights;
    }).then(async data => {
        // Insights SQL statements
        if(data['data'].length > 0) {
        // Loop through all data returned and upload each chunk of data
        for (let i = 0; i < data['data'].length; i++) {
            // Calculate views
            console.log(data['data'][i], all_account_info)
            let accViews = await getViews(all_account_info, data['data'][i].date_start, data['data'][i].date_stop);
            /*Future optimization: calculate based on platform instead of doing both then separating*/
            /*Insights are separated by publisher platform, can get page/profile views based on that*/
            if (data['data'][i]['publisher_platform'] === 'facebook') {
                data['data'][i]['views'] = accViews['FB'];
            } else if (data['data'][i]['publisher_platform'] === 'instagram') {
                data['data'][i]['views'] = accViews['IG'];
            } else {
                data['data'][i]['views'] = accViews['FB'] + accViews['IG'];
            }
            InsightSQLUpload(data['data'][i], poolConnection);
        }
        } else {
            console.log(`No Data for ${entity_id}`);
        }
        return data;
    }).then(async insightData => {
        // GET PAGE LEADS
        let allLeads = await getLeads(all_account_info, entity_id, entity_name)
        console.log('EVERY LEAD', allLeads)
        for (let i = 0; i < allLeads[0].length; i++) {
            console.log(allLeads[0][i])
            LeadsSQLUpload(allLeads[0][i], poolConnection);
        }
        return allLeads[1];

        // NEED TO ADD account_name page_id page_name to SQL & database
    })
    .then((idData) => {
        // Upload data to Leads_Parents
        for (let i = 0; i < idData.length; i++) {
            ParentsSQLUpload(idData[i], poolConnection);
        }
    })
    .then(async () => {
        // Get campaigns
        let uniqueCamps = await getAccountCampaigns(entity_id, poolConnection);
        return uniqueCamps
    })
    .then((campaignList) => {
        // Get campaign insights then upload them
        //getCampaignInsights(entity_id, entity_name, poolConnection)
        for (let i = 0; i < campaignList.length; i++) {
            getCampaignInsights(campaignList[i], entity_id.split('_')[1], poolConnection);
        }
    })
    .catch(err => {
        console.error(err);
    });

}

async function getNextPage(url) {
    let response = fetch(url);
    const res = await response;
    console.log('next!')
    return res.json();
}

async function getAdAccounts() {
    let access_token = process.env.ACESS_KEY;
    let url = 'https://graph.facebook.com/v20.0/me/adaccounts?fields=account_id,name,promote_pages' + '&access_token=' + access_token
   // + '&limit=999'
    const res = await fetch(url);
    return await res.json();
}

async function getMatchingAcc(acc, allAccounts) {
    return allAccounts.filter((account) => {
        return account['id'] === acc;
    })[0];
}

async function uploadData(allAccounts, poolConnection) {
    //calls get ad account
    let accounts = {}
    getAdAccounts().then(async data => {
        accounts['data'] = data['data'];
        if (data['paging']['next']) {
            accounts['next'] = data['paging']['next']
        }
        // Handle pagination
        while (accounts['next']) {
            let nextData = await getNextPage(accounts['next']);
            accounts['data'] = accounts['data'].concat(nextData['data']);
            if(nextData['paging']['next']) {
                accounts['next'] = nextData['paging']['next'];
            } else {
                accounts['next'] = false;
            }
        }
        return accounts['data'];
    }).then(async dataNext => {
         const allData = async() => {
             const dataMap = dataNext.map((async (account) => {
                let promote_pages = account.promote_pages ? account.promote_pages['data'] : null;
                let all_account_info = [];
                if (promote_pages) {
                    for (let i = 0; i < promote_pages.length; i++) {
                        let currAcc = await getMatchingAcc(promote_pages[i].id, allAccounts);
                        all_account_info.push(currAcc);
                    }
                }
                console.log(account.name, all_account_info)
                 FBInsights('act_' + account.account_id, account.name, all_account_info, poolConnection);
             }));
             await Promise.all(dataMap);
         }
         allData();
    })
}

async function run(poolConnection) {
    getAccountInfo((data) => {
        return data['data']
    }).then((acc) => {
        uploadData(acc['data'], poolConnection)
    });
}

module.exports = { run }
