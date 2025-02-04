import { PortfolioItem } from '@/components/freelance/portfolio/PortfolioItem';
import bcgHome from './images/bcg-home.png';
import diool from './images/diool.png';
import docdokuPlm from './images/docdoku-plm.png';
import eyeloDashboard from './images/eyelo-dashboard.png';
import nautoEventDetails from './images/nauto-event-details.png';
import nautoEventList from './images/nauto-event-list.png';
import samDetails from './images/sam-details.png';
import samHome from './images/sam-home.png';
import samNewAccessRequest from './images/sam-new-access-request.png';
import swaapHome from './images/swaap-home.png';
import swaapPortfolio from './images/swaap-portfolio.png';
import swaapVault from './images/swaap-vault.png';
import * as React from 'react';
import { NeutralLink } from '@robusta/pyramids-links';

export default function RobustaPortfolio() {
  return (
    <section>
      <main className={'blog-container'}>
        <h1>Portfolio: Amazing apps built</h1>
        <div className={'gapper gap-20'}>
          <PortfolioItem
            images={[swaapHome, swaapPortfolio, swaapVault]}
            title={'Swaap Finance (2021-2024, web3)'}
          >
            <p>
              This web3 application for Swaap Finance allow users to deposit
              money into the blockchain via a secured smart contract. The smart
              contract will produce market making for the benefit of the user.
            </p>

            <p>
              <NeutralLink href={'https://www.swaap.finance'}>
                Visit Swaap Finance site
              </NeutralLink>
            </p>
          </PortfolioItem>

          <PortfolioItem
            images={[nautoEventDetails, nautoEventList]}
            title={'Nauto AI (2021-2022, React + d3.js)'}
          >
            <p>
              Nauto AI is a californian scale-up introducing real time sensors
              in fleet cars – such as Fedex or UPS. The system detects driver
              errors and are aggregated into dashboards.
            </p>
            <p>
              <NeutralLink href={'https://www.nauto.com'}>
                Visit Nauto AI site
              </NeutralLink>
            </p>
          </PortfolioItem>

          <PortfolioItem images={[diool]} title={'Diool (2019-2020, Angular)'}>
            <p>
              Diool is a mobile application in Cameroon that allows users to pay
              their bills with phone.
            </p>
            <p>
              <NeutralLink href={'https://www.diool.com'}>
                Visit Diool site
              </NeutralLink>
            </p>
          </PortfolioItem>

          <PortfolioItem
            images={[bcgHome]}
            title={'Boston Consulting Group (2020, Java)'}
          >
            <p>
              I had the luck to work with this huge American firm to deploy the
              new CMS. The work was technically not that hard (mainly basic Java
              servlets and CSS), but result pressure was intense.
            </p>
            <p>
              <NeutralLink href={'https://www.bcg.com'}>
                Visit Boston Consulting Group site
              </NeutralLink>
            </p>
          </PortfolioItem>

          <PortfolioItem
            images={[samHome, samDetails, samNewAccessRequest]}
            title={'Renault SAM (2019-2020, CQRS/Event-Sourcing)'}
          >
            <p>
              SAM is a tool to simplify access to Renault’s internal tools. I
              proposed and implemented an economical and innovative
              CQRS/Event-Sourcing architecture
            </p>
          </PortfolioItem>

          <PortfolioItem
            images={[eyeloDashboard]}
            title={'Eyelo (2015, Angular)'}
          >
            <p>
              Eye.lo is a tracker for telecoms. The application allow admin
              users to create customized dashboards for functional users – such
              as sellers or CEO. It’s a huge Javascript app for this epoch, made
              with plain old Angular JS.
            </p>
          </PortfolioItem>

          <PortfolioItem
            images={[docdokuPlm]}
            title={'DocDoku (2013, Three.js)'}
          >
            <p>
              Docdoku PLM is a PLM software running on Ipad, transforming Catia
              data into Three.js structures. Very innovative, we were able to
              build this working mvp in a few month with only 5 people.
            </p>
          </PortfolioItem>
        </div>
      </main>
    </section>
  );
}
