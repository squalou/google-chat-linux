javascript: (
    function() {
		var css = 
			`/* Specify color for thread links */
            .threadlink {
                color: rgb(202, 196, 201);
            }
            /* Global Background color */
            .Bl2pUd {
                background-color: #212121;
            }
            /* Global background color in private messages */
            .WQKmIb .Bl2pUd, .WQKmIb .byY7Yb {
                background-color: #2d2d2d;
            }
            /* Global background color in room preview */
            .x7DKme {
                background-color: #212121 !important;
            }
            /* Global background color in search results */
            .pWhTUc {
                background-color: #212121 !important;
            }
            
            /* Title in private messages */
            .CmMf8e {
                color: rgb(202, 196, 201);
            }
            /* Title in channels */
            .tCUB4c {
                color: rgb(202, 196, 201);
            }
            
            /* Topbar background color */
            .QTQg5e {
                background: #212121;
                border-bottom: 1px solid #6a6a6a;
            }
            /* Topbar left button text color */
            .nk7hB, .wWf0Bc, .nk7hB .cAW0Vc {
                color: #fff;
            }
            /* Topbar right buttons color */
            .Nj8aCb.Nj8aCb {
                color: #fff;
                fill: #fff;
            }
            /* Notifications active/disabled status button */
            .gWTIDe {
                color: rgb(202, 196, 201);
            }
            /* Thread boxes colors */
            .dsoUjb {
                background-color: #2d2d2d;
                border: solid 1px #4a4a4a;
            }
            .oGsu4 {
                background-color: #2d2d2d;
            }
            .nF6pT.FwR7Pc .iKCcE, .hu21Y:hover {
                background-color: #3f3f3f;
            }
            .XbbXmb.zzVqCe .nF6pT, .jGyvbd .jO0Dzb, .dsoUjb .jGyvbd .jO0Dzb {
                background-color: #2d2d2d;
            }
            
            /* Thread boxes in pm */
            .WQKmIb .dsoUjb {
                background-color: #2d2d2d !important;
                border: solid 1px #2d2d2d !important;
            
            }
            
            /* Thread boxes in search results */
            .d4FIEb .ajCeRb .QIJiHb {
                color: #fff !important;
            }
            /* Room title between threads in search results */
            .aVIRye {
                color: #cc7832 !important;
            }
            /* Load more messages button in search results */
            .taQuBe {
                color: rgb(202, 196, 201);
                background-color: #2d2d2d;
            }
            
            /* Topbar members button */
            .sNyyib .x1jjEb {
                background-color: #cc7832;
                padding: 0px 8px;
            }
            
            /* Topbar in room preview */
            .oPqlY {
                background-color: #2d2d2d !important;
            }
            
            /* Edit/react/delete buttons on message */
            .f8lxbf {
                fill: rgb(202, 196, 201);
            }
            .eWw5ab {
                background-color: #2d2d2d;
                border: solid 1px #5f5f5f;
            }
            .MbhUzd {
                background-color: #cc7832;
            }
            
            /* Active thread box */
            .cZICLc:hover .dsoUjb {
                border: solid 1px #aa5010;
            }
            
            /* "Unread" label */
            .Fv5sh {
                color: #cc7832;
            }
            .z9ucM .heceU {
                fill: #cc7832;
            }
            
            /* Jump to bottom button */
            .g3VIld .HvOprf, .e3Duub, .w63zXd .NMPajd {
                background-color: #cc7832;
            }
            .g3VIld .HvOprf:hover, .e3Duub:hover, .w63zXd:hover .NMPajd {
                background-color: #aa5010;
            }
            
            /* Collapsed messages button */
            .zPVzl {
                background: transparent;
            }
            .Jqvwfe {
                background-color: #3d3d3d;
                border: solid 1px #6a6a6a;
                color: #cc7832;
            }
            
            /* Username color */
            .cmEq8b .Zc1Emd, .cmEq8b .Z4BnXb {
                color: rgb(202, 196, 201);
            }
            
            /* Follow button color */
            .zxHSSc {
                color: #EEBE67;
                background-color: #2d2d2d;
                border: solid 1px #3f3f3f;
            }
            .yg4pvb::before {
                background: transparent;
            }
            .zxHSSc.FuHVqe {
                background-color: rgba(150,30,30,0.300);
            }
            
            /* Cancel button when editing a message */
            .HQ8yf .RveJvd.RveJvd, .oG5Srb .RveJvd.RveJvd, .KV0KFc .ojqkvd {
                color: #cc7832;
            }
            
            /* Borders in message editing */
            .cVKqyc {
                border: solid 1px #6a6a6a;
            }
            
            /* Answer box background color */
            .vmpzOc, .PhFuQe.yXgmRe .dJ9vNe, .dJ9vNe {
                background-color: #2d2d2d;
            }
            /* Cursor and text input color */
            .oAzRtb {
                caret-color: #fff;
                color: #fff;
            }
            /* Answer box border when active */
            .PhFuQe.yXgmRe .dJ9vNe {
                border: solid 2px #5f5f5f;
            }
            /* Answer box border when inactive */
            .dJ9vNe {
                border: solid 1px #4a4a4a;
            }
            /* Answer box right buttons */
            .fKz7Od {
                color: rgb(202, 196, 201);
                fill: rgb(202, 196, 201);
            }
            
            /* New thread button */
            .SfqTBc {
                background-color: #2d2d2d;
            }
            .aVw1Ob {
                color: rgb(202, 196, 201);
            }
            .SfqTBc .jy2fzc {
                color: #cc7832;
            }
            
            /* New thread box */
            .XganBc {
                background-color: #2d2d2d;
                border: solid 0px #5f5f5f;
            }
            .p9Cqzd { /* exit cross */
                fill: #fff;
            }
            .qnCNBb { /* "New thread" label */
                color: #fff;
            }
            .zFe2Ef:not(.RDPZE) .v6TC2e { /* send button when active */
                fill: #cc7832;
            }
            
            /* Join room box in room preview */
            .BhQsO {
                color: #fff !important;
            }
            .CjSwue {
                background-color: #2d2d2d !important;
            }
            /* Join button */
            .W32wZ {
                background-color: #cc7832;
            }
            
            /* Text between threads color */
            .A2BXPe {
                color: #fff; 
            }
            
            /* Sidebar color and border */
            .X9KLPc {
                background-color: #2d2d2d;
                border-right: solid 1px #6a6a6a;
            }
            
            /* Sidebar elemtents bg color when hovering */
            .PL5Wwe:focus:not(.dQ2Tsf),
            .PL5Wwe:hover:not(.dQ2Tsf),
            .tuKyod .LoYJxb {
                background-color: #3f3f3f;
            }
            
            /* Sidebar channel icons */
            .SwwApf, .SwwApf.qkl0pe {
                background-color: transparent;
            }
            
            /* Sidebar active channel */
            .FS4hgd.iWO5td .ojqkvd, .FS4hgd.iWO5td, .dHI9xe.qs41qe, .dHI9xe.KKjvXb.KKjvXb, .dHI9xe.qs41qe .ojqkvd.ojqkvd, .dHI9xe.KKjvXb.KKjvXb .ojqkvd {
                color: #fff;
            }
            .FS4hgd.iWO5td.iWO5td, div .dHI9xe.KKjvXb, div .dHI9xe.qs41qe {
                background-color: #cc7832;
            }
            .PL5Wwe:focus:not(.dQ2Tsf) {
                background-color: #aa5010;
            }
            
            /* Sidebar elements text color for chans with unread messages */
            .PL5Wwe.H7du2 .t5F5nf {
                color: #fff;
            }
            
            /* Channel name color in sidebar */
            .t5F5nf {
                color: rgb(202, 196, 201);
            }
            
            /* "Unread" jump button in sidebar */
            .OpmeVb .GfYBMd, .FTuhNb .RW5Kg {
                fill: #cc7832;
                color: #cc7832;
            }
            
            /* Sidebar "recent" or "starred" section names color */
            .aOHsTc {
                color: rgb(202, 196, 201);
            }
            
            /* Sidebar Search section text color */
            .HLTcjb {
                color: rgb(202, 196, 201);
            }
            .D3DXDc {
                fill: rgb(202, 196, 201) !important;
            }
            
            /* Sidebar search button hovering bg color */
            .GbZFNe:focus, .GbZFNe:hover {
                background-color: #3f3f3f;
            }
            
            /* Sidebar search button shadow */
            .d6pS5 {
                box-shadow: 0 5px 5px -2px black;
                padding-bottom: 0;
            }
            
            /* Search menu text color */
            .Uk0Bfe .zHQkBf, .Uk0Bfe .snByac, .dQ2Tsf .NXfF8b, .dQ2Tsf .ZTmjQb {
                color: #000;
            }
            
            .ndJi5d {
                color: rgba(0,0,0,0.38);
            }
            
            /* Search menu elements colors when hovering */
            .dQ2Tsf[aria-selected="true"], .PL5Wwe:hover > .dQ2Tsf {
                background-color: #eee;
                color: #fff
            }
            
            /* Search menu people list mail color */
            .dQ2Tsf[aria-selected="true"] .Kfe2Ub, .PL5Wwe:hover > .dQ2Tsf .Kfe2Ub {
                color: #000;
            }
            
            /* Top left corner section (with title) background color and border */
            .Riuhhf {
                background-color: #212121;
                border-right: solid 1px #6a6a6a;
                border-bottom: solid 1px #6a6a6a;
            
            }
            
            /* Chat top left logo text color */
            #XMLID_8_-Clipped{
                opacity: 0.8 !important;
                fill: #fff !important;
            }
            
            /* Chat top left logo */
            #_x3C_Path_x3E_ {
                fill: #cc7832;
            }
            
            /* Top left corner Status button when active */
            .RASpke {
                border: 0px;
            }
            .RASpke:hover, .RASpke:focus, .RASpke:hover:focus, .RASpke:active, .RASpke.iWO5td.iWO5td {
                background-color: #cc7832;
            }
            
            /* Time and menu buttons and clock for channels inactive and active colors */
            .sFuxxd {
                color: rgb(202, 196, 201);
            }
            .PL5Wwe.H7du2 .sFuxxd {
                color: #fff;
            }
            .DQy0Rb {
                fill: rgb(202, 196, 201) !important;
            }
            .PL5Wwe.H7du2 .DQy0Rb {
                fill: #fff !important;
            }
            .QeRfYe {
                fill: rgb(202, 196, 201) !important;
            }
            .PL5Wwe.H7du2 .QeRfYe {
                fill: #fff !important;
            }
            
            /* Code snippets colors */
            .FMTudf, .Zc1Emd div {
                border: 1px solid #6a6a6a!important;
                background: #3d3d3d!important;
                color: #fff!important;
            }
            
            /* Inline pre colors */
            .U8d2H, .Zc1Emd span:not(.NhKrqd):not(.fWwrkf) {
                background-color: #3d3d3d!important;
                color: #cc7832!important;
                border: 1px solid #6a6a6a!important;
            }
            
            /* Self Mentions */
            .cmEq8b .NhKrqd {
                background-color: #cc7832;
            }
            /* Others' mentions */
            .fWwrkf {
                color: #cc7832;
            }
            
            /* People's name before message */
            .cmEq8b .Z4BnXb .njhDLd {
                color: rgb(202, 196, 201);;
                font-weight: 1000;
            }
            
            /* Link previews */
            .Pj9rof {
                background-color: #2d2d2d;
                border: 1px solid #6a6a6a;
            }
            .kmatHb, .hlrRUb {
                color: rgb(202, 196, 201);
                background: transparent;
            }
            .SXFjfb {
                background-color: #2d2d2d;
                border-top: 1px solid #6a6a6a;
            }
            
            /* images */
            .KuG0bc {
                border: 1px solid #6a6a6a;
            }
            
            /* Message suggestions */
            .T9VbLe {
                background-color: #2d2d2d;
                border: 1px solid #6a6a6a;
            }
            .ubzhQb {
                color: #cc7832;
            }
            
            /* Emoji reactions */
            .dIC9Jb .lFwksc, .YJxKBc .JGMh2e {
                background-color: #2d2d2d;
                border: 1px solid #6a6a6a;
            }
            .YK45Id {
                color: #ccc;
            }
            .dIC9Jb.CwpxMe .j3630e {
                color: #cc7832;
            }
            
            div .mUbCce:hover, div .mUbCce:focus, div .mUbCce:active, div .mUbCce.qs41qe, div .mUbCce.u3bW4e, .JRtysb:hover .snByac, .JRtysb:focus .snByac, .JRtysb:active .snByac, .JRtysb.qs41qe .snByac, .JRtysb.u3bW4e .snByac {
                fill: #cc7832;
            }
            
            /* browse room and search exit button */
            .xTcvqe .fKz7Od, .wbJc4 .fKz7Od {
                color: #000 !important;
                fill: #000 !important;
            }

            /* webhook msg */
            .aPoydb .PiXiEf .ohJDzb .Iia6Bd {
                background-color: #aaa;
            }

            .hg6pPc {
                background-color: #aaa!important;
            }
            
            .SwwApf,
            .SwwApf.qkl0pe {
                background-color: transparent;
            }
            
            .d6pS5 {
                -moz-box-shadow: none;
                box-shadow: none;
            }
            
            .SwwApf {
                height: 24px;
                width: 24px;
            }
            
            /* discussion pic */
            .biNtD,
            .tzwwSb {
                -moz-border-radius: 5px;
                border-radius: 5px;
                background-color: transparent;
                height: 24px;
                width: 24px;;
            }
            
            /* remove last text */
            .kjWKTd {
                display: none;
            }
            
            /* Quick search first element bg color */
            .dQ2Tsf[aria-selected="true"] {
                background: transparent;
            }
            
            /* Padding height between messages in a thread */
            .nF6pT {
                padding-top: 6px;
            }
            /* Sidebar "recent" or "starred" section title padding height */
            .wJNchb,
            .nFzS9e {
                margin-top: 10px;
            }
            
            
            /* Draw white line between the sidebar sections and reduce padding */
            .PL5Wwe+.wJNchb,
            .teTAFe:not(.fXx9Lc)+.vHL80e .aOHsTc {
             /*   border-top: solid 1px #e0e0e0; */
                padding-top: 6px;
            }
            /* Sidebar channels elements height */
            .LoYJxb {
                height: 18px;
            }
            /* Vertically align triple dots buttons on
             channels in sidebar with the new height */
            .MhXXcc {
                line-height: 26px;
            }
            .gsrV1e {
                height: 22px;
                width: 22px;
            }
            .QeRfYe .Lw7GHd {
                margin: 2px 6px 0 6px;
            }
            /* Big emojis size */
            .Zc1Emd.NM3Nfc {
                font-size: 24px;
            }
            /* Inline emojis size */
            img {
                border: none;
                font-size: 1.3em !important;
            }
            /* Reduce top margin in thread block */
            .dsoUjb {
                padding: 15px 0;
            }
            /* Reduce size of reply button */
            .dCMjy {
                width: 20px;
                min-width: 20px;
                height: 20px;
                min-height: 20px;
                margin-right: 36px;
            }
            /* Reduce space around blue NEW alert */
            .k1lILc {
                padding: 5px 0 0;
            }
            .k1lILc+.ajCeRb {
                padding-top: 5px;
            }
            /* Reduce space between thread blocks */
            .cZICLc {
                margin-top: 6px;
            }
            /* Increase boldness of usenames in conversations */
            .Z4BnXb {
                font-weight: 900;
            }
            
            /* Make code snippets look like slack's */
            .FMTudf {
                font-family: Monaco, Menlo, Consolas, "Courier New", monospace !important;
                font-size: .75rem;
                border: 1px solid #e0e0e0;
                margin: 10px 0;
                padding: 3px 10px;
                background: #f9f9f9;
                -webkit-border-radius: 4px;
                -moz-border-radius: 4px;
                border-radius: 4px;
            }
            /* Make inline pre look like slack's */
            .U8d2H {
                font-family: Monaco, Menlo, Consolas, "Courier New", monospace !important;
                background-color: #f7f7f9;
                margin: 0px;
                padding: 1px 3px;
                color: #d72b3f;
                -webkit-border-radius: 3px;
                -moz-border-radius: 3px;
                border-radius: 3px;
            }
            /* Reduce sidebar width */
            .X9KLPc,
            .Riuhhf {
                width: 280px
            }
            /* Reduce margin above "Starred" label */
            .aOHsTc {
                margin-top: 5px;
            }
            /* Fix emojis dimensions */
            .iiJ4W {
                height: auto;
                width: auto;
                max-height: 1.2em;
                max-width: 1.2em;
                /* min-width: auto;    deactivation pour afficher les icones UTF8  */
            }
            /* Reduce size of New conv button */
            .SfqTBc {
                padding: 4px 18px 4px 12px;
            }
          
            `,

            head = document.getElementsByTagName('head')[0],
            style = document.createElement('style'),
            account = document.getElementById('gbpbt');
            if ( account && account.innerText && account.innerText.includes("boxtal.com")){
                document.getElementsByClassName('SZ9zpc')[0].innerHTML = '<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2aWV3Qm94PSIwIDAgNjcyLjIgMTMwLjciPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0yMTMuOCAxMTEuMWwtMy45IDkuMy0zLjctOS4zaC0yLjhsNS4yIDExLjl2Ny4zaDIuNVYxMjNsNS4yLTExLjl6Ii8+PGRlZnM+PHBhdGggaWQ9ImEiIGQ9Ik0wIDBoNjcyLjJ2MTMwLjdIMHoiLz48L2RlZnM+PGNsaXBQYXRoIGlkPSJiIj48dXNlIHhsaW5rOmhyZWY9IiNhIiBvdmVyZmxvdz0idmlzaWJsZSIvPjwvY2xpcFBhdGg+PHBhdGggY2xpcC1wYXRoPSJ1cmwoI2IpIiBmaWxsPSIjZmZmIiBkPSJNMjI5LjMgMTIzLjNWMTE3YzAtMy44IDItNi4zIDYuMS02LjNzNi4xIDIuNSA2LjEgNi4zdjYuM2MwIDUuMy0yIDcuNC02LjEgNy40cy02LjEtMi4xLTYuMS03LjRtOS42LjF2LTYuNWMwLTQtMi44LTQuMi0zLjUtNC4yLS44IDAtMy41LjEtMy41IDQuMnY2LjVjMCA0LjIgMS4yIDUuMyAzLjUgNS4zczMuNS0xLjEgMy41LTUuM20xNy40LTEyLjNoMi41djEyLjNjMCA0LjIgMS4zIDUuMyAzLjYgNS4zczMuNi0xLjEgMy42LTUuM3YtMTIuM2gyLjV2MTIuMmMwIDUuMy0yIDcuNC02LjEgNy40cy02LTIuMS02LTcuNHYtMTIuMnptMjkuNCAxMC40djguOGgtMi41di0xOS4yaDYuNmMzLjQgMCA0LjYgMi40IDQuNiA0LjggMCAyLjMtMS4zIDQtMy41IDQuNHYuMWMyLjIuMyAzIDEuMSAzLjEgNSAwIC44LjMgMy44LjcgNWgtMi42Yy0uNy0xLjMtLjUtMy44LS43LTYuNC0uMi0yLjMtMi4xLTIuNS0yLjktMi41aC0yLjh6bTAtMi4yaDMuN2MxLjggMCAyLjYtMS41IDIuNi0zLjIgMC0xLjQtLjctMi45LTIuNi0yLjloLTMuN3Y2LjF6bTQxLjYgNS4zdi42YzAgMi42IDEuNyAzLjQgMy4yIDMuNCAxLjkgMCAzLjQtLjggMy40LTMuMSAwLTQuMy04LjYtMy44LTguNi05LjYgMC0zLjQgMi40LTUuMiA1LjctNS4yIDMuNSAwIDUuNSAxLjcgNS4zIDUuNmgtMi42YzAtMi4xLS42LTMuNS0zLTMuNS0xLjUgMC0zIC43LTMgMi44IDAgNC4yIDguNiAzLjYgOC42IDkuNyAwIDQuMS0yLjggNS40LTYgNS40LTUuNy4xLTUuNy00LjMtNS42LTYuMWgyLjZ6bTIzLjcgNS43di0xOS4yaDIuNXY4LjNoNi43di04LjNoMi41djE5LjJoLTIuNXYtOC44aC02Ljd2OC44em0yNy4xLTE5LjJoMi41djE5LjJoLTIuNXptMTguMSAxOS4ydi0xOS4yaDUuN2MyLjYgMCA1LjQgMSA1LjQgNS41IDAgNC40LTMuNCA1LjMtNS40IDUuM2gtMy4ydjguNWgtMi41em0yLjUtMTAuNmgyLjdjMSAwIDMuNC0uMyAzLjQtMy4zIDAtMi45LTIuMi0zLjItMi43LTMuMmgtMy40djYuNXptMjMgMTAuNnYtMTkuMmg1LjdjMi42IDAgNS40IDEgNS40IDUuNSAwIDQuNC0zLjQgNS4zLTUuNCA1LjNoLTMuMnY4LjVoLTIuNXptMi41LTEwLjZoMi43YzEgMCAzLjQtLjMgMy40LTMuMyAwLTIuOS0yLjItMy4yLTIuNy0zLjJoLTMuNHY2LjV6bTIzLTguNmgyLjV2MTkuMmgtMi41em0zMS4xIDB2MTkuMmgtMy40bC03LjYtMTYuN3YxNi43aC0yLjJ2LTE5LjJoMy41bDcuNCAxNi41aC4xdi0xNi41em0yNC4zIDUuMWMwLTIuMy0uOS0zLjUtMy40LTMuNS0uOCAwLTMuNS4xLTMuNSA0LjJ2Ni41YzAgNC4yIDEuMiA1LjMgMy41IDUuMyAxLjggMCAyLjktLjUgMy40LS45VjEyMmgtMy41di0yLjFoNnY5LjRjLTEuNi45LTMuNCAxLjQtNS45IDEuNC00LjEgMC02LjEtMi4xLTYuMS03LjRWMTE3YzAtMy44IDItNi4zIDYuMS02LjMgNC4yIDAgNi4xIDEuNSA2IDUuNWgtMi42em0zNC4zIDE0LjF2LTE5LjJoMTB2Mi4xaC03LjV2Ni4yaDYuOXYyLjFoLTYuOXY2LjdoNy42djIuMXptMzYuNCAwaC0zbC00LjUtOC4yLTQuMiA4LjJoLTIuN2w1LjYtOS45LTUuMy05LjNoMi45bDMuOSA3LjQgNC03LjRoMi43bC01LjIgOS4zem0xMy41IDB2LTE5LjJoNS43YzIuNiAwIDUuNCAxIDUuNCA1LjUgMCA0LjQtMy40IDUuMy01LjQgNS4zaC0zLjJ2OC41aC0yLjV6bTIuNC0xMC42aDIuN2MxIDAgMy40LS4zIDMuNC0zLjMgMC0yLjktMi4yLTMuMi0yLjctMy4yaC0zLjR2Ni41em0yMi43IDEwLjZ2LTE5LjJoOS45djIuMWgtNy40djYuMmg2Ljl2Mi4xaC02Ljl2Ni43aDcuNnYyLjF6bTI2LjQtOC44djguOGgtMi41di0xOS4yaDYuNmMzLjQgMCA0LjYgMi40IDQuNiA0LjggMCAyLjMtMS4zIDQtMy41IDQuNHYuMWMyLjIuMyAzIDEuMSAzLjEgNSAwIC44LjMgMy44LjcgNWgtMi42Yy0uNy0xLjMtLjUtMy44LS43LTYuNC0uMi0yLjMtMi4xLTIuNS0yLjktMi41aC0yLjh6bTAtMi4yaDMuN2MxLjggMCAyLjYtMS41IDIuNi0zLjIgMC0xLjQtLjctMi45LTIuNi0yLjloLTMuN3Y2LjF6bTMzLjktOC4ydjIuMWgtNS4xdjE3LjFoLTIuNHYtMTcuMWgtNS4xdi0yLjF6TTIzMC42IDg2LjNoLTI3LjFWLjhoMjcuM2MxNi43IDAgMjQuNyAxMC45IDI0LjcgMjEuMyAwIDcuNC0zLjYgMTQuMy0xMC42IDE3Ljh2LjFjOS41IDIuMiAxNi4yIDEwLjUgMTYuMiAyMC42LS4xIDEyLjItOSAyNS43LTMwLjUgMjUuN00yMjYuOCAxNGgtNy43djIyLjNoOS4zYzUuNiAwIDExLjItNC41IDExLjItMTEuMy4xLTYuNC00LjEtMTEtMTIuOC0xMW0zIDM1LjVoLTEwLjZ2MjMuNmgxMGMxMC41IDAgMTUuNy00LjcgMTUuNy0xMi41IDAtNi42LTUuNS0xMS4xLTE1LjEtMTEuMW0xMjcuNyAyNS44Yy03LjggNy44LTE4LjYgMTIuMy0zMS40IDEyLjMtMTIuNSAwLTIyLjctMy42LTMwLjMtMTAuNS04LjctNy44LTEzLjUtMTkuMy0xMy41LTMyLjcgMC0xMi43IDQuNC0yMy45IDEyLjMtMzEuOUMzMDIuNCA0LjcgMzEzLjEgMCAzMjYuMSAwYzEzLjggMCAyNS4yIDQuOCAzMi44IDEzLjIgNy4xIDcuOCAxMC44IDE4LjQgMTAuOCAzMC40IDAgMTIuNi00LjIgMjMuOS0xMi4yIDMxLjdNMzI2IDEzLjFjLTE2IDAtMjcuMSAxMS42LTI3LjEgMzAuOCAwIDE5LjMgMTEuMiAzMC45IDI3LjEgMzAuOSAxNS44IDAgMjctMTEuNiAyNy0zMC45IDAtMTguNy0xMC42LTMwLjgtMjctMzAuOE00NTkuMS44aC0xNy4ybC0yMC42IDMxLjFMNDAxLjcuOEgzODRsMjYuNCA0MS44LTMwIDQzLjdoMTcuNUw0MTkuNiA1NGwyMC41IDMyLjNINDU4bC0yNy41LTQyLjcgMTkuOC0yOS43aDI2Ljl2NzIuNGgxNS45VjEzLjloMjMuM0w1MjIgLjd6bTEyNy4zIDg1LjVMNTc4IDY0LjloLTMwLjVsLTcuOSAyMS40aC0xNS40TDU1Ny40LjRoMTEuNGwzNC40IDg1LjloLTE2Ljh6bS0yMC4zLTUzLjhjLTEuNi00LjMtMi42LTcuOC0zLjItMTAuNmgtLjFjLS41IDMtMS43IDYuNC0zLjEgMTAuNGwtNy40IDE5LjlINTczbC02LjktMTkuN3ptNTkuOCA1My44Vi44aDE1Ljd2NzIuM2gzMC42djEzLjJ6bS00NTQtNDcuMUgyMS4yYy0zLjggMC02LjggMy4xLTYuOCA2LjhzMy4xIDYuOCA2LjggNi44aDE1MC42YzMuOCAwIDYuOC0zLjEgNi44LTYuOHMtMy02LjgtNi43LTYuOG0tNjQuNiAzOC40SDYuOEMzIDc3LjYgMCA4MC43IDAgODQuNHMzLjEgNi44IDYuOCA2LjhoMTAwLjRjMy44IDAgNi44LTMuMSA2LjgtNi44cy0zLTYuOC02LjctNi44bTU0LjggMzguM0g2MS42Yy0zLjggMC02LjggMy4xLTYuOCA2LjggMCAzLjggMy4xIDYuOCA2LjggNi44SDE2MmMzLjggMCA2LjgtMy4xIDYuOC02LjguMS0zLjctMy02LjgtNi43LTYuOE0xMzAuNS44SDU3LjNjLTMuOCAwLTYuOCAzLjEtNi44IDYuOHMzLjEgNi44IDYuOCA2LjhoNzMuMmMzLjggMCA2LjgtMy4xIDYuOC02LjhzLTMtNi44LTYuOC02LjgiLz48L3N2Zz4="  width="145px" height="30px" style="margin-left:12px;margin-top:20px;"  />'
            }

        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));
        head.appendChild(style);
            
	}()
);