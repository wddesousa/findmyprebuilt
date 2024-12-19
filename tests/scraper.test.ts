import {expect, test} from 'vitest'
import { Scrape } from '@/app/api/scraper/utils'

test('scraper', async () => {
    const test = await Scrape('https://pcpartpicker.com/product/3hyH99/amd-ryzen-7-7800x3d-42-ghz-8-core-processor-100-100000910wof')
    console.log(test)
})