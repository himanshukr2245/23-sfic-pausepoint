package org.pausepoint.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import org.pausepoint.app.shield.plugin.ShieldPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(ShieldPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
