import https from 'https'
import url from 'url'
import querystring from 'querystring'
import _ from 'lodash'
import Promise from 'bluebird'

export function getRepos (opts) {
    return new Promise((fulfill, reject) => {
        const
            parseLinkHeader = (header) => {
                // https://gist.github.com/niallo/3109252
                if (!(header && header.length)) {
                    console.error("input must not be of zero length")
                    return false
                }
                const parts = header.split(',')
                const links = {}
                _.each(parts, (p) => {
                    const section = p.split('')
                    if (section.length != 2) {
                        console.error("section could not be split on ''")
                        return false
                    }
                    let url = section[0].replace(/<(.*)>/, '$1').trim()
                    const name = section[1].replace(/rel="(.*)"/, '$1').trim()
                    url = `/${url.slice(url.indexOf('?'))}`
                    links[name] = url
                })
                return links
            }

        opts = _.merge({
            query: {
                page: 1,
                per_page: 10
            },
            user: 'jeresig'
        }, opts)

        const params = url.parse('https://api.github.com/users/' + opts.user + '/repos' + querystring.stringify(opts.query))
        params.headers = {
            'user-agent': 'virgoNode'
        }
        https
            .get(params, quest => {
                let data = ''
                quest.on('data', d => {
                    data += d
                })
                quest.on('end', () => {
                    const repos = JSON.parse(data), links = parseLinkHeader(quest.headers.link)
                    if (repos.message) {
                        reject({
                            message: 'Github repository not avaliable!'
                        })
                        return
                    }
                    fulfill({
                        repos,
                        links,
                        user: opts.user,
                        query: opts.query
                    })
                })
            })
            .on('error', err => {
                console.error(err)
                reject({
                    message: 'Github repository not avaliable!'
                })
            })
        
    })
}
