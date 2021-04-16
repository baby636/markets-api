import 'dotenv/config'

import server from '../src/server'
import models from '../src/models'
import MarketsSyncer from '../src/services/MarketsSyncer'
import MarketInfoProvider from '../src/services/providers/MarketInfoProvider'
import CoingeckoProvider from '../src/services/providers/CoingeckoProvider'
import DefiLlamaProvider from '../src/services/providers/DefiLlamaProvider'
import CoinInfoManager from '../src/managers/CoinInfoManager'
import logger from '../src/logger'
import coinConfig from '../src/managers/coins.info.json'
import CryptoCompareProvider from '../src/services/providers/CryptoCompareProvider'
import CryptoNewsProvider from '../src/services/providers/CryptoNewsProvider'
import CryptoNewsSyncer from '../src/services/CryptoNewsSyncer'

const coingeckoProvider = new CoingeckoProvider()
const cryptoCompareProvider = new CryptoCompareProvider()
const cryptoNewsProvider = new CryptoNewsProvider(cryptoCompareProvider)
const cryptoNewsSyncer = new CryptoNewsSyncer(cryptoNewsProvider)

const defiLlamaProvider = new DefiLlamaProvider()
const marketInfoProvider = new MarketInfoProvider(coingeckoProvider, defiLlamaProvider)
const marketsSyncer = new MarketsSyncer(marketInfoProvider, coinConfig.supported_currencies)
const coinInfoManager = new CoinInfoManager()

server.listen(process.env.PORT, () => {
  logger.info(`Server started at port ${process.env.PORT}`)

  models.sequelize.sync({ force: false }).then(() => {
    coinInfoManager.init()
    marketsSyncer.start()
    cryptoNewsSyncer.start()
  })
})
