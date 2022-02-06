import { IonApp, IonRouterOutlet, IonSplitPane } from '@ionic/react';

import { IonReactRouter } from '@ionic/react-router';
import { Route } from 'react-router-dom';

import Home from './pages/Home';

import { setupIonicReact } from '@ionic/react';

setupIonicReact();

const AppShell = () => {
  return (
    <IonApp>
      <IonReactRouter>
        <IonSplitPane contentId="main">
          <IonRouterOutlet id="main">
            <Route path="/" render={() => <Home />} />
          </IonRouterOutlet>
        </IonSplitPane>
      </IonReactRouter>
    </IonApp>
  );
};

export default AppShell;
