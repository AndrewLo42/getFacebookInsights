const sql = require('mssql');
require('dotenv').config();

function getFBViews(id, date_start, date_stop, page_access_token) {
    let new_date = date_stop;
    if (date_start !== date_stop) {
        new_date = subDays(date_start, 1)
    }
    let access_token = page_access_token;
    let url = 'https://graph.facebook.com/v20.0/'
     + id
     + '/insights/page_views_total'
     + `?since=${date_start}&until=${new_date}`
    //  + '?since=2024-07-02&until=2024-07-05'
     + '&access_token=' + access_token;
    const response = fetch(url);
    return response.then(res => {
        return res.json();
    }).then((data) => {
        console.log(data)
        let viewData = []
        for (let i = 0; i < data['data'].length; i++) {
            if (data['data'][i]['period'] === 'day') {
                viewData = (data['data'][i]['values']);
            }
        }
        return viewData
    }).then((viewData) => {
        let totalViews = 0;
        for (let i = 0; i < viewData.length; i++) {
            totalViews = viewData[i].value + totalViews;
        }
        let final = {
            view_info: viewData,
            total_views: totalViews
        }
        return final
    }).catch((err) => {
        console.error(err)
    })
}

function subDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() - days);
    return new Date(result).toISOString().split('T')[0];;
  }

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return new Date(result).toISOString().split('T')[0];;
  }

function getIGViews(ig_account, date_start, date_stop) {
    if (!ig_account) {
        console.log('no IG account')
        return 'None';
    }
    let new_date = date_stop;
    if (date_start === date_stop) {
        new_date = addDays(date_stop, 1)
    }
    let access_token = process.env.ACCESS_KEY;
    let url = 'https://graph.facebook.com/v20.0/'
     + ig_account
     + '/insights?metric=profile_views'
     + '&period=day'
     + `&since=${date_start}&until=${new_date}`
    //  + '&since=2024-07-01&until=2024-07-31'
     + '&access_token=' + access_token;
    const response = fetch(url);
    return response.then(res => {
        return res.json();
    }).then((data) => {
        let viewData = []
        for (let i = 0; i < data['data'].length; i++) {
            if (data['data'][i]['period'] === 'day') {
                viewData = data['data'][i]['values'];
            }
        }
        return viewData
    }).then((viewData) => {
        let totalViews = 0;
        for (let i = 0; i < viewData.length; i++) {
            totalViews = viewData[i].value + totalViews;
        }
        let final = {
            view_info: viewData,
            total_views: totalViews
        }
        return final
    }).catch((err) => {
        console.error(err)
    })
}

async function getAccountInfo() {
    let access_token = process.env.ACCESS_KEY;
    let url = 'https://graph.facebook.com/v20.0/me/accounts?fields=name,access_token,instagram_business_account' 
    + "&limit=999"
    + '&access_token=' + access_token
    const res = await fetch(url);
    return await res.json();
}


async function getViews(account, date_start, date_stop) {
    let views = {
        'FB': 0,
        'IG': 0,
    }
    try {
        for (let i = 0; i < account.length; i++) {
            let FBVIEW = await getFBViews(account[i].id, date_start, date_stop, account[i].access_token)
            views['FB'] = account[i].id ? (FBVIEW['total_views'] + views['FB']) : null;
    
            let IGViews = await getIGViews(account[i].instagram_business_account ? account[i].instagram_business_account.id : null, date_start, date_stop)
            views['IG'] = IGViews === 'None' ? null : (IGViews['total_views'] + views['IG']);
        }
    } catch (err) {
        console.error(err)
    } finally {
        return views;
    }
}

module.exports = { getViews, getAccountInfo }