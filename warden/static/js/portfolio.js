
$(document).ready(function () {
    console.log("-------------");
    console.log("00000080   01 04 45 54 68 65 20 54  69 6D 65 73 20 30 33 2F   ..EThe Times 03/");
    console.log("00000090   4A 61 6E 2F 32 30 30 39  20 43 68 61 6E 63 65 6C   Jan/2009 Chancel");
    console.log("000000A0   6C 6F 72 20 6F 6E 20 62  72 69 6E 6B 20 6F 66 20   lor on brink of ");
    console.log("000000B0   73 65 63 6F 6E 64 20 62  61 69 6C 6F 75 74 20 66   second bailout f");
    console.log("000000C0   6F 72 20 62 61 6E 6B 73  FF FF FF FF 01 00 F2 05   or banksÿÿÿÿ..ò.");
    console.log("--------------");

    // Format Red and Green Numbers (negative / positive)
    red_green()
    $('.lifo_costtable').toggle();


    $('#dismiss_balances').click(function () {
        $('#dismiss_balances').html('Please wait...');
        $('#dismiss_balances').prop('disabled', true);
        $.ajax({
            type: "POST",
            contentType: 'application/json',
            dataType: "json",
            url: "/dismiss_notification",
            success: function (data_back) {
                location.reload()
            },
            error: function (xhr, status, error) {
                console.log(status);
                console.log(error);
                alerts_html = $('#alerts').html();
                $('#alerts').html(alerts_html + "<div class='small alert alert-danger alert-dismissible fade show' role='alert'>An error occured while refreshing data." +
                    "<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div>")
            }
        });
    });

    // Function to get the max value in an Array
    Array.max = function (array) {
        return Math.max.apply(Math, array);
    };

    // Function to get the min value in an Array
    Array.min = function (array) {
        return Math.min.apply(Math, array);
    };

    // set run_once to true so some functions at ajax are only executed once
    run_once = true;
    realtime_table();
    getNodeInfo();
    update_mempool();

    // Popover management
    // Default popover enabler from Bootstrap
    $('[data-toggle="popover"]').popover()
    // The below lines are needed to include a table inside a popover
    // Taken from here:
    // https://stackoverflow.com/questions/55362609/bootstrap-4-3-1-popover-does-not-display-table-inside-popover-content
    $.fn.popover.Constructor.Default.whiteList.table = [];
    $.fn.popover.Constructor.Default.whiteList.tr = [];
    $.fn.popover.Constructor.Default.whiteList.td = [];
    $.fn.popover.Constructor.Default.whiteList.div = [];
    $.fn.popover.Constructor.Default.whiteList.tbody = [];
    $.fn.popover.Constructor.Default.whiteList.thead = [];
    // If clicked outside of popover, it closes
    $('.popover-dismiss').popover({
        trigger: 'focus'
    })
    // Start this function whenever a popup opens
    $('[data-toggle="popover"]').on('shown.bs.popover', onPopoverHtmlLoad)

    $('.edit_tx_button').click(function () {
        this_var = $(this)
        edit_tx(this_var);
    });

    function edit_tx(this_var) {
        console.log(this_var)
    }


    $('.FIFOLIFOmodal').click(function () {
        $('#FIFOLIFOModal').modal('show');
        this_var = $(this)
        updateModal(this_var);
    });

    // Main function to update the Modal with some cost calculations
    function updateModal(this_var) {
        ticker = (this_var.data('ticker'));
        accounting = (this_var.data('accounting'));
        $.ajax({
            type: 'GET',
            url: '/accounting_json?ticker=' + ticker + '&method=' + accounting,
            dataType: 'html',
            success: function (data) {
                // Parse data
                $('#accounting_table').html('<br> ' + data + '<br>');
            },
            error: console.log("AJAX Error")
        });

    }


    function onPopoverHtmlLoad() {
        ticker = $(this).data('ticker')
        this_var = $(this)
        accounting = $(this).data('accounting')
        // Get the cost table for this ticker
        $.ajax({
            type: 'GET',
            url: '/positions_json',
            dataType: 'json',
            success: function (data) {
                // Parse data
                var fx = data.user.symbol
                var pop_html = `
                <div class="row">
                    <div class='col-sm-6'>
                        <table class="table table-condensed table-striped popover_table">
                            <tbody>
                                <tr>
                                    <td>
                                        Operation
                                    </td>
                                    <td class="text-right">
                                        Quantity
                                    </td>
                                    <td class="text-right">
                                    ` + data.user.name_plural + `
                                    </td>
                                </tr>
                            <tr>
                                <td>
                                    Deposits
                                    </td>
                                <td class="text-right">
                                    ` + formatNumber(data.positions[ticker].trade_quantity_B, 4) + `
                                    </td>
                                <td class="text-right">
                                    ` + formatNumber(data.positions[ticker].cash_value_fx_B, 0, fx) + `
                                    </td>
                            </tr>

                            <tr>
                                <td>
                                    Withdraws
                                    </td>
                                <td class="text-right">
                                    ` + formatNumber(data.positions[ticker].trade_quantity_S, 4) + `
                                    </td>
                                <td class="text-right">
                                    ` + formatNumber(data.positions[ticker].cash_value_fx_S, 0, fx) + `
                                    </td>
                            </tr>

                            <tr class="thead-dark">
                            <td>
                                Total
                                </td>
                            <td class="text-right"> <span class="numberCircle">&nbsp1&nbsp</span>
                                ` + formatNumber(data.positions[ticker][accounting + '_quantity'], 4) + `
                                </td>
                            <td class="text-right"> <span class="numberCircle">&nbsp2&nbsp</span>
                                ` + formatNumber(data.positions[ticker].cash_value_fx, 0, fx) + `

                                </td>
                            </tr>

                            </tbody>
                        </table >

                        <table class="table table-condensed table-striped popover_table">
                            <tbody>

                                <tr>
                                    <td>
                                    ` + accounting + ` Average Cost
                                    </td>
                                    <td class="text-right">
                                    ` + formatNumber(data.positions[ticker][accounting + '_average_cost'], 2, fx) + `
                                    <span class="numberCircle">&nbsp9&nbsp</span>
                                    </td>
                                </tr>

                                <tr>
                                    <td>
                                    Unrealized PnL = ( <span class="numberCircle">&nbsp3&nbsp</span> - <span class="numberCircle">&nbsp9&nbsp</span> ) X <span class="numberCircle">&nbsp1&nbsp</span>
                                    </td>
                                    <td class="text-right">
                                    ` + formatNumber(data.positions[ticker][accounting + '_unreal'], 0, fx) + `
                                    <span class="numberCircle">&nbsp10&nbsp</span>
                                    </td>
                                </tr>

                                <tr>
                                    <td>
                                    Unrealized Break Even = <span class="numberCircle">&nbsp3&nbsp</span> - ( <span class="numberCircle">&nbsp10&nbsp</span> &#xF7 <span class="numberCircle">&nbsp1&nbsp</span> )
                                    </td>
                                    <td class="text-right">
                                    ` + formatNumber(data.positions[ticker][accounting + '_unrealized_be'], 2, fx) + `

                                    </td>
                                </tr>

                                <tr>
                                    <td>
                                    Realized PnL = ( <span class="numberCircle">&nbsp7&nbsp</span> - <span class="numberCircle">&nbsp10&nbsp</span> )
                                    </td>
                                    <td class="text-right">
                                    ` + formatNumber(data.positions[ticker][accounting + '_real'], 0, fx) + `

                                    </td>
                                </tr>


                            </tbody>
                        </table>


                    </div>

                    <div class="col-sm-6">
                        <table class="table table-condensed table-striped popover_table">
                            <tbody>

                                <tr>
                                    <td>
                                    Open Position
                                    </td>
                                    <td class="text-right">
                                    ` + formatNumber(data.positions[ticker][accounting + '_quantity'], 4) + `
                                    <span class="numberCircle">&nbsp1&nbsp</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                     Price
                                    </td>
                                    <td class="text-right">
                                        ` + formatNumber(data.positions[ticker].price, 2, fx) + `
                                        <span class="numberCircle">&nbsp3&nbsp</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                    Current Market Value = <span class="numberCircle">&nbsp1&nbsp</span> X <span class="numberCircle">&nbsp3&nbsp</span>
                                    </td>
                                    <td class="text-right">
                                        ` + formatNumber(data.positions[ticker].position_fx, 0, fx) + `
                                        <span class="numberCircle">&nbsp4&nbsp</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                    Total Cash Flow
                                    </td>
                                    <td class="text-right">
                                    ` + formatNumber(data.positions[ticker].cash_value_fx, 0, fx) + `
                                    <span class="numberCircle">&nbsp2&nbsp</span>
                                    </td>
                                </tr>

                                <tr>
                                    <td>
                                    Gross PnL = <span class="numberCircle">&nbsp4&nbsp</span> - <span class="numberCircle">&nbsp2&nbsp</span>
                                    </td>
                                    <td class="text-right">
                                    ` + formatNumber(data.positions[ticker].pnl_gross, 0, fx) + `
                                    <span class="numberCircle">&nbsp5&nbsp</span>
                                    </td>
                                </tr>

                                <tr>
                                    <td>
                                    Fees
                                    </td>
                                    <td class="text-right">
                                    ` + formatNumber(data.positions[ticker].trade_fees_fx, 0, fx) + `
                                    <span class="numberCircle">&nbsp6&nbsp</span>
                                    </td>
                                </tr>

                                <tr>
                                    <td>
                                    Net PnL = <span class="numberCircle">&nbsp5&nbsp</span> - <span class="numberCircle">&nbsp6&nbsp</span>
                                    </td>
                                    <td class="text-right">
                                    ` + formatNumber(data.positions[ticker].pnl_net, 0, fx) + `
                                    <span class="numberCircle">&nbsp7&nbsp</span>
                                    </td>
                                </tr>

                                <tr>
                                    <td>
                                    Break Even price = ( <span class="numberCircle">&nbsp2&nbsp</span> + <span class="numberCircle">&nbsp6&nbsp</span> ) &#xF7 <span class="numberCircle">&nbsp1&nbsp</span>
                                    </td>
                                    <td class="text-right">
                                    ` + formatNumber(data.positions[ticker].breakeven, 2, fx) + `
                                    <span class="numberCircle">&nbsp8&nbsp</span>
                                    </td>
                                </tr>


                            </tbody>
                        </table>
                    </div>

                </div>

                    `

                this_var.attr('data-content', pop_html).data('bs.popover').setContent()
                $('[data-toggle="popover"]').popover({

                    html: true
                })

            },
        })

    }


    // Refresh pricings
    window.setInterval(function () {
        realtime_table();
    }, 5000);

    window.setInterval(function () {
        getNodeInfo();
        update_mempool();
    }, 60000);



    // Grab Portfolio NAV Statistics from JSON and return to table
    $.ajax({
        type: 'GET',
        url: '/portstats',
        dataType: 'json',
        success: function (data) {
            $('#end_nav').html(data.end_nav.toLocaleString('en-US', { style: 'decimal', maximumFractionDigits: 2, minimumFractionDigits: 2 }));
            var max_nav_txt = data.max_nav.toLocaleString('en-US', { style: 'decimal', maximumFractionDigits: 2, minimumFractionDigits: 2 }) + "<span class='small'> on "
            max_nav_txt = max_nav_txt + data.max_nav_date + "</span>"
            $('#max_nav').html(max_nav_txt);
            var min_nav_txt = data.min_nav.toLocaleString('en-US', { style: 'decimal', maximumFractionDigits: 2, minimumFractionDigits: 2 }) + "<span class='small'> on "
            min_nav_txt = min_nav_txt + data.min_port_date + "</span>"
            $('#min_nav').html(min_nav_txt);

            $('#end_portvalue_usd').html(data.end_portvalue_usd.toLocaleString('en-US', { style: 'decimal', maximumFractionDigits: 0, minimumFractionDigits: 0 }));
            
            var max_pv_txt = data.max_portvalue.toLocaleString('en-US', { style: 'decimal', maximumFractionDigits: 0, minimumFractionDigits: 0 }) + "<span class='small'> on "
            max_pv_txt = max_pv_txt + data.max_port_date + "</span>"
            $('#max_portvalue').html(max_pv_txt);
            $('#return_1d').html((data.return_1d * 100).toLocaleString('en-US', { style: 'decimal', maximumFractionDigits: 2, minimumFractionDigits: 2 }) + "%");
            $('#return_1wk').html((data.return_1wk * 100).toLocaleString('en-US', { style: 'decimal', maximumFractionDigits: 2, minimumFractionDigits: 2 }) + "%");
            $('#return_30d').html((data.return_30d * 100).toLocaleString('en-US', { style: 'decimal', maximumFractionDigits: 2, minimumFractionDigits: 2 }) + "%");
            $('#return_90d').html((data.return_90d * 100).toLocaleString('en-US', { style: 'decimal', maximumFractionDigits: 2, minimumFractionDigits: 2 }) + "%");
            $('#return_ATH').html((data.return_ATH * 100).toLocaleString('en-US', { style: 'decimal', maximumFractionDigits: 2, minimumFractionDigits: 2 }) + "%");
            $('#return_SI').html((data.return_SI * 100).toLocaleString('en-US', { style: 'decimal', maximumFractionDigits: 2, minimumFractionDigits: 2 }) + "%");
            var stats_dates_txt = data.start_date + " to " + data.end_date
            $('#stats_dates_txt').html(stats_dates_txt);

            red_green();
        }
    });


    // Get NAV Data for chart
    $.ajax({
        type: 'GET',
        url: '/navchartdatajson',
        dataType: 'json',
        success: function (data) {
            navChart(data);
        }
    });

    // Get stack Data for chart
    $.ajax({
        type: 'GET',
        url: '/stackchartdatajson',
        dataType: 'json',
        success: function (data) {
            stackChart(data);
        }
    });

    // Get stack Data for chart
    $.ajax({
        type: 'GET',
        url: '/fiatchartdatajson',
        dataType: 'json',
        success: function (data) {
            fiatChart(data);
        }
    });

    // Get stack Data for chart
    $.ajax({
        type: 'GET',
        url: '/btcchartdatajson',
        dataType: 'json',
        success: function (data) {
            btcChart(data);
        }
    });
});

function update_mempool() {
    $.ajax({
        type: 'GET',
        url: '/mempool_json',
        dataType: 'json',
        success: function (data) {
            if (data['error'] == 'Mempool.space seems to be unavailable. Maybe node is still synching.') {
                $('#mempool_body').html("<span><i class='text-warning fas fa-heart-broken'></i>&nbsp&nbspAn error occured while connecting to Mempool.space at <a href='" + data['mp_url'] + "' target='_blank'>" + data['mp_url'] + "</a></span><br><span class='small text-muted'>" + data['error'] + '</span>');
            } else if (data['error'] == null) {
                const currentTimeStamp = new Date().getTime();
                $('#fastest_fee').html(formatNumber(data['mp_fee']['fastestFee'], 0, '', ' sats/Vb'));
                $('#30min_fee').html(formatNumber(data['mp_fee']['halfHourFee'], 0, '', ' sats/Vb'));
                $('#1hr_fee').html(formatNumber(data['mp_fee']['hourFee'], 0, '', ' sats/Vb'));
                // Block 0
                time_ago_0 = timeDifference(currentTimeStamp, data['mp_blocks'][0]['timestamp'] * 1000)
                $('#time_0').html(time_ago_0);
                $('#height_01').html(formatNumber(data['mp_blocks'][0]['height'], 0, ''));
                $('#height_0').html(formatNumber(data['mp_blocks'][0]['height'], 0, ''));
                $('#txs_0').html(formatNumber(data['mp_blocks'][0]['tx_count'], 0, ''));
                $('#size_0').html(formatNumber(data['mp_blocks'][0]['size'] / 1000, 0, '', ' MB'));
                // Block 1
                time_ago_1 = timeDifference(currentTimeStamp, data['mp_blocks'][1]['timestamp'] * 1000)
                $('#time_1').html(time_ago_1);
                $('#height_1').html(formatNumber(data['mp_blocks'][1]['height'], 0, ''));
                $('#txs_1').html(formatNumber(data['mp_blocks'][1]['tx_count'], 0, ''));
                $('#size_1').html(formatNumber(data['mp_blocks'][1]['size'] / 1000, 0, '', ' MB'));
                // Block 2
                time_ago_2 = timeDifference(currentTimeStamp, data['mp_blocks'][2]['timestamp'] * 1000)
                $('#time_2').html(time_ago_2);
                $('#height_2').html(formatNumber(data['mp_blocks'][2]['height'], 0, ''));
                $('#txs_2').html(formatNumber(data['mp_blocks'][2]['tx_count'], 0, ''));
                $('#size_2').html(formatNumber(data['mp_blocks'][2]['size'] / 1000, 0, '', ' MB'));
                // Block 3
                time_ago_3 = timeDifference(currentTimeStamp, data['mp_blocks'][3]['timestamp'] * 1000)
                $('#time_3').html(time_ago_3);
                $('#height_3').html(formatNumber(data['mp_blocks'][3]['height'], 0, ''));
                $('#txs_3').html(formatNumber(data['mp_blocks'][3]['tx_count'], 0, ''));
                $('#size_3').html(formatNumber(data['mp_blocks'][3]['size'] / 1000, 0, '', ' MB'));
                // Block 4
                time_ago_4 = timeDifference(currentTimeStamp, data['mp_blocks'][4]['timestamp'] * 1000)
                $('#time_4').html(time_ago_4);
                $('#height_4').html(formatNumber(data['mp_blocks'][4]['height'], 0, ''));
                $('#txs_4').html(formatNumber(data['mp_blocks'][4]['tx_count'], 0, ''));
                $('#size_4').html(formatNumber(data['mp_blocks'][4]['size'] / 1000, 0, '', ' MB'));
                // Block 5
                time_ago_5 = timeDifference(currentTimeStamp, data['mp_blocks'][5]['timestamp'] * 1000)
                $('#time_5').html(time_ago_5);
                $('#height_5').html(formatNumber(data['mp_blocks'][5]['height'], 0, ''));
                $('#txs_5').html(formatNumber(data['mp_blocks'][5]['tx_count'], 0, ''));
                $('#size_5').html(formatNumber(data['mp_blocks'][5]['size'] / 1000, 0, '', ' MB'));

                $('#mempool_source').html('<a href=' + data['mp_url'] + '>Source : ' + data['mp_url'] + '</a>')
            } else {
                $('#mempool_body').html("<span><i class='text-warning fas fa-heart-broken'></i>&nbsp&nbspAn error occured while connecting to Mempool.space at <a href='" + data['mp_url'] + "' target='_blank'>" + data['mp_url'] + "</a></span><br><span class='small text-muted'>" + data['error'] + '</span>');
            }
        }
    });
}




//  HELPER FUNCTION
// Runs the class to change pos numbers to green and neg to red
function red_green() {
    // re-apply redgreen filter (otherwise it's all assumed positive since fields were empty before ajax)
    $(".redgreen").removeClass('red_negpos');
    $(".redgreen").addClass('green_negpos');
    $(".redgreen:contains('-')").removeClass('green_negpos');
    $(".redgreen:contains('-')").addClass('red_negpos');
    // Hide NaN
    $(".redgreen:contains('NaN%')").addClass('text-white');
}


// Updates the realtime table of prices and positions
function realtime_table() {
    // Grab Portfolio NAV Statistics from JSON and return to table
    $.ajax({
        type: 'GET',
        url: '/positions_json',
        dataType: 'json',
        success: function (data) {
            // Now assign the values from the JSON to the table
            // variable fx will contain the user's currency symbol
            var fx = data.user.symbol
            // Parse the json
            $('#pvalue').html(formatNumber(data.positions.Total.position_fx, 0, fx)).fadeTo(100, 0.3, function () { $(this).fadeTo(500, 1.0); });
            $('#pvaluebtc').html(formatNumber(data.positions.Total.position_btc, 6, '₿ ')).fadeTo(100, 0.3, function () { $(this).fadeTo(500, 1.0); });
            $('#pvaluesats').html(formatNumber(data.positions.Total.position_btc * 100000000, 0, '丰 ')).fadeTo(100, 0.3, function () { $(this).fadeTo(500, 1.0); });

            $('#end_portvalue').html(formatNumber(data.positions.Total.position_fx, 0)).fadeTo(100, 0.3, function () { $(this).fadeTo(500, 1.0); });
            posUSD = data.positions.Total.position_fx / fx_rate
            $('#end_portvalueUSD').html(formatNumber(posUSD, 0)).fadeTo(100, 0.3, function () { $(this).fadeTo(500, 1.0); });

            posbtc = data.positions.Total.position_fx / data.btc
            $('#chg1').html(formatNumber(data.positions.Total.change_fx, 0, fx)).fadeTo(100, 0.3, function () { $(this).fadeTo(500, 1.0); });;
            pct_chg = (data.positions.Total.change_fx / data.positions.Total.position_fx) * 100
            $('#chg2').html(formatNumber(pct_chg, 2, '+', '%', 'False', true)).fadeTo(100, 0.3, function () { $(this).fadeTo(500, 1.0); });;
            $('#lstupd').html(data.positions.Total.last_up_source).fadeTo(100, 0.3, function () { $(this).fadeTo(500, 1.0); });
            // Update BTC price on layout
            $('#latest_btc_price').html(formatNumber(data.btc, 2, fx)).fadeTo(100, 0.3, function () { $(this).fadeTo(500, 1.0); });;

            // Totals for FIFO and LIFO tables
            $('#F_total').html(formatNumber(data.positions.Total.position_fx, 0, fx, ''));
            $('#F_real').html(formatNumber(data.positions.Total.FIFO_real, 0, fx, ''));
            $('#F_unreal').html(formatNumber(data.positions.Total.FIFO_unreal, 0, fx, ''));
            $('#F_pnl').html(formatNumber(data.positions.Total.pnl_net, 0, fx, ''));
            $('#F_fees').html(formatNumber(data.positions.Total.trade_fees_fx, 0, fx, ''));
            $('#L_total').html(formatNumber(data.positions.Total.position_fx, 0, fx, ''));
            $('#L_real').html(formatNumber(data.positions.Total.LIFO_real, 0, fx, ''));
            $('#L_unreal').html(formatNumber(data.positions.Total.LIFO_unreal, 0, fx, ''));
            $('#L_pnl').html(formatNumber(data.positions.Total.pnl_net, 0, fx, ''));
            $('#L_fees').html(formatNumber(data.positions.Total.trade_fees_fx, 0, fx, ''));


            // Loop through tickers to fill the tables
            $.each(data.positions, function (key, value) {
                // Portfolio Snapshot
                if (value.price != 0) {
                    $('#' + key + '_price').html(formatNumber(value.price, 2, fx, '')).fadeTo(100, 0.3, function () { $(this).fadeTo(500, 1.0); });
                    $('#' + key + '_24hchg').html(formatNumber(value['24h_change'], 2, '+', '%', 'False', true)).fadeTo(100, 0.3, function () { $(this).fadeTo(500, 1.0); });;
                    $('#' + key + '_position').html(formatNumber(value.position_fx, 0, fx, ''));
                    $('#' + key + '_btc_position').html(formatNumber(value.position_btc, 4, '', ''));
                    $('#' + key + '_allocation').html(formatNumber(value.allocation * 100, 2, '', '%'));

                    // FIFO Table values
                    $('#' + key + '_F_position').html(formatNumber(value.position_fx, 0, fx, ''));
                    $('#' + key + '_fifo_real').html(formatNumber(value.FIFO_real, 0, fx, ''));
                    $('#' + key + '_fifo_unreal').html(formatNumber(value.FIFO_unreal, 0, fx, ''));
                    $('#' + key + '_fifo_unreal_be').html(formatNumber(value.FIFO_unrealized_be, 2, fx, '', value.small_pos));
                    $('#' + key + '_F_trade_fees_fx').html(formatNumber(value.trade_fees_fx, 0, fx, ''));
                    $('#' + key + '_F_pnl_net').html(formatNumber(value.pnl_net, 0, fx, ''));
                    $('#' + key + '_F_breakeven').html(formatNumber(value.breakeven, 2, fx, '', value.small_pos));
                    x = ((value.price / value.breakeven) - 1) * 100
                    $('#' + key + '_perc_breakeven').html(formatNumber(x, 2, '', '%', value.small_pos));

                    // LIFO Table values
                    $('#' + key + '_L_position').html(formatNumber(value.position_fx, 0, fx, ''));
                    $('#' + key + '_lifo_real').html(formatNumber(value.LIFO_real, 0, fx, ''));
                    $('#' + key + '_lifo_unreal').html(formatNumber(value.LIFO_unreal, 0, fx, ''));
                    $('#' + key + '_lifo_unreal_be').html(formatNumber(value.LIFO_unrealized_be, 2, fx, '', value.small_pos));
                    $('#' + key + '_L_trade_fees_fx').html(formatNumber(value.trade_fees_fx, 0, fx, ''));
                    $('#' + key + '_L_pnl_net').html(formatNumber(value.pnl_net, 0, fx, ''));
                    $('#' + key + '_L_breakeven').html(formatNumber(value.breakeven, 2, fx, '', value.small_pos));

                    // Market Data values
                    $('#' + key + '_mkt_price').html(formatNumber(value.price, 2, fx, '')).fadeTo(100, 0.3, function () { $(this).fadeTo(500, 1.0); });;
                    $('#' + key + '_24h_change').html(formatNumber(value['24h_change'], 2, '+', '%', 'False', true)).fadeTo(100, 0.3, function () { $(this).fadeTo(500, 1.0); });;
                    var price_range = formatNumber(value['24h_low'], 2, fx, '') + ' - ' + formatNumber(value['24h_high'], 2, fx, '')
                    $('#' + key + '_24h_range').html(price_range);
                    $('#' + key + '_volume').html(formatNumber(value.volume, 0, fx, ''));
                    if (value.notes != null) {
                        $('#' + key + '_volume').html(value.notes);
                    }
                    $('#' + key + '_mktcap').html(formatNumber(value.mktcap, 0, fx, ' bi'));
                    $('#' + key + '_source').html(value.source);
                    update = new Date(value.last_update)
                    if (update.getHours() == 0 && update.getMinutes() == 0 && update.getSeconds() == 0) {
                        update = (update.getMonth() + 1) + '-' + update.getDate() + '-' + update.getFullYear()
                    } else {
                        if (isNaN(update.getHours())) {

                        } else {
                            update = update.getHours() + ':' + update.getMinutes() + ':' + update.getSeconds()
                        }
                    }
                    if (update == 'Invalid Date') {
                        update = '-'
                    }
                    $('#' + key + '_lastupdate').html(update);
                }
                // Add small position class to hide/show small positions
                if (value.small_pos == "True") {
                    $('#ticker' + key).addClass('small_pos')
                    $('#tickerfifo_' + key).addClass('small_pos')
                    $('#tickerlifo_' + key).addClass('small_pos')
                    $('#tickerdata_' + key).addClass('small_pos')
                    // Hide the calculators for small positions
                    $('#' + key + '_be_calculator_FIFO').html(" ")
                    $('#' + key + '_be_calculator_LIFO').html(" ")
                    $('#' + key + '_pnl_calculator_FIFO').html(" ")
                    $('#' + key + '_pnl_calculator_LIFO').html(" ")
                }

            })

            // Functions that should only be run once during the page refresh
            if (run_once == true) {
                $('.small_pos').toggle(100);
            }

            red_green();
            run_once = false
        }
    });


};




function getNodeInfo() {
    // GET latest Bitcoin Block Height
    $.ajax({
        type: 'GET',
        url: '/specter',
        dataType: 'json',
        success: function (data) {
            console.log(data)
            $('#latest_btc_block').html(data['bitcoin_core_data']['Blocks count']);
            $('#current_block').html(data['bitcoin_core_data']['Blocks count']);
            $('#size_on_disk').html(data['bitcoin_core_data']['Size on disk']);
            $('#difficulty').html(data['bitcoin_core_data']['Difficulty']);
            $('#specter_refresh').html(data['last_update']);
            const currentTimeStamp = new Date().getTime();
            last_up_specter = new Date(data['last_update'])
            specter_difference = timeDifference(currentTimeStamp, last_up_specter)

            if (specter_difference.indexOf('seconds') != -1) {
                color = 'success'
            } else if (specter_difference.indexOf('minutes') != -1) {
                color = 'warning'
            } else {
                color = 'danger'
            }
            ago_string = "<span class='text-" + color + "'>" + specter_difference + "</span>"

            $('#specter_refresh_ago').html(ago_string);

            $('#core_version').html(data['bitcoin_core_data']['Bitcoin Core Version']);
            $('#connection_count').html(data['bitcoin_core_data']['Connections count']);
            $('#mempool_size').html(data['bitcoin_core_data']['Mempool Size']);
            $('#uptime').html(data['bitcoin_core_data']['Node uptime']);
            if ('specter_health' in data) {
                $("#specter_health").html(data['specter_health']);
            } else {
                $("#specter_health").html('Could not check [Retrying..]')
            }

        },
        error: function (xhr, status, error) {
            console.log(status);
            console.log(error);
            $('#latest_btc_block').html("[Error]");
            console.log("Error: failed to download node data")
        }
    });
};


// NAV CHART
function navChart(data) {
    var myChart = Highcharts.stockChart('navchart', {
        credits: {
            text: ""
        },
        navigator: {
            enabled: false
        },
        rangeSelector: {
            selected: 4
        },
        chart: {
            zoomType: 'xy',
            backgroundColor: "#FAFAFA",
        },
        title: {
            text: 'Portfolio NAV over time',
            style: {
                fontSize: '12px'
            }
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: 'NAV'
            },
            startOnTick: false,
            endOnTick: false
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            area: {
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
                marker: {
                    radius: 2
                },
                lineWidth: 1,
                states: {
                    hover: {
                        lineWidth: 1
                    }
                },
                threshold: null
            }
        },

        series: [{
            type: 'spline',
            dataGrouping: {
                enabled: false
            },
            name: 'NAV',
            // The line below maps the dictionary coming from Python into
            // the data needed for highcharts. It's weird but the *1 is
            // needed, otherwise the date does not show on chart.
            data: Object.keys(data).map((key) => [((key * 1)), data[key]]),
            turboThreshold: 0,
            tooltip: {
                pointFormat: "NAV (first trade=100): {point.y:,.0f}"
            }
        }]
    });

};


// Stack CHART
function stackChart(data) {
    var myChart = Highcharts.stockChart('stackchart', {
        credits: {
            text: ""
        },
        navigator: {
            enabled: false
        },
        rangeSelector: {
            selected: 4,
            style: {
                fontSize: '10px'
            }
        },
        chart: {
            zoomType: 'xy',
            backgroundColor: "#FAFAFA",
        },
        title: {
            text: 'Portfolio value in ₿',
            style: {
                fontSize: '12px'
            }
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: 'Stack Size'
            },
            startOnTick: false,
            endOnTick: false,
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            area: {
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
                marker: {
                    radius: 2
                },
                lineWidth: 1,
                states: {
                    hover: {
                        lineWidth: 1
                    }
                },
                threshold: null
            }
        },

        series: [{
            type: 'area',
            dataGrouping: {
                enabled: false
            },
            name: 'Stack',
            // The line below maps the dictionary coming from Python into
            // the data needed for highcharts. It's weird but the *1 is
            // needed, otherwise the date does not show on chart.
            data: Object.keys(data).map((key) => [((key * 1)), data[key]]),
            turboThreshold: 0,
            tooltip: {
                pointFormat: "Stack Size: {point.y:,.0f} ₿"
            }
        }]
    });

};


// Stack CHART
function fiatChart(data) {
    var myChart = Highcharts.stockChart('fiatchart', {
        credits: {
            text: "Remember all Fiat is trending to the same place... Zero."
        },
        navigator: {
            enabled: false
        },
        rangeSelector: {
            selected: 4,
            style: {
                fontSize: '10px'
            }
        },
        chart: {
            zoomType: 'xy',
            backgroundColor: "#FAFAFA",
        },
        title: {
            text: 'Portfolio value in Fiat',
            style: {
                fontSize: '12px'
            }
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: 'Value in Fiat ($)'
            },
            startOnTick: false,
            endOnTick: false
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            area: {
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
                marker: {
                    radius: 2
                },
                lineWidth: 1,
                states: {
                    hover: {
                        lineWidth: 1
                    }
                },
                threshold: null
            }
        },

        series: [{
            type: 'area',
            dataGrouping: {
                enabled: false
            },
            name: 'Stack',
            // The line below maps the dictionary coming from Python into
            // the data needed for highcharts. It's weird but the *1 is
            // needed, otherwise the date does not show on chart.
            data: Object.keys(data).map((key) => [((key * 1)), data[key]]),
            turboThreshold: 0,
            tooltip: {
                pointFormat: "$ {point.y:,.0f}"
            }
        }]
    });

};



// Stack CHART
function btcChart(data) {
    var myChart = Highcharts.stockChart('btcchart', {
        credits: {
            text: "Useless chart since 1 BTC = 1 BTC. But here it is."
        },
        navigator: {
            enabled: false
        },
        rangeSelector: {
            selected: 4,
            style: {
                fontSize: '10px'
            }
        },
        chart: {
            zoomType: 'xy',
            backgroundColor: "#FAFAFA",
        },
        title: {
            text: ' BTC value in Fiat',
            style: {
                fontSize: '12px'
            }
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: 'Value in Fiat ($)'
            },
            startOnTick: false,
            endOnTick: false
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            area: {
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
                marker: {
                    radius: 2
                },
                lineWidth: 1,
                states: {
                    hover: {
                        lineWidth: 1
                    }
                },
                threshold: null
            }
        },

        series: [{
            type: 'spline',
            color: '#dfa38e',
            dataGrouping: {
                enabled: false
            },
            name: 'Stack',
            // The line below maps the dictionary coming from Python into
            // the data needed for highcharts. It's weird but the *1 is
            // needed, otherwise the date does not show on chart.
            data: Object.keys(data).map((key) => [((key * 1)), data[key]]),
            turboThreshold: 0,
            tooltip: {
                pointFormat: "$ {point.y:,.0f}"
            }
        }]
    });

};




function heat_color(object) {
    // Get all data values from our table cells making sure to ignore the first column of text
    // Use the parseInt function to convert the text string to a number
    var counts_positive = $(object).map(function () {
        if (parseFloat($(this).text()) > 0) {
            return parseFloat($(this).text());
        };
    }).get();

    var counts_negative = $(object).map(function () {
        if (parseFloat($(this).text()) < 0) {
            return parseFloat($(this).text());
        };
    }).get();

    // run max value function and store in variable
    var max = Array.max(counts_positive);
    var min = Array.min(counts_negative) * (-1);

    n = 100; // Declare the number of groups

    // Define the ending colour, which is white
    xr = 230; // Red value
    xg = 233; // Green value
    xb = 237; // Blue value

    // Define the starting colour for positives
    yr = 97; // Red value 243
    yg = 184; // Green value 32
    yb = 115; // Blue value 117

    // Define the starting colour for negatives
    nr = 226; // Red value 243
    ng = 156; // Green value 32
    nb = 131; // Blue value 117

    // Loop through each data point and calculate its % value
    $(object).each(function () {
        if (parseFloat($(this).text()) > 0) {
            var val = parseFloat($(this).text());
            var pos = parseFloat((Math.round((val / max) * 100)).toFixed(0));
            red = parseInt((xr + ((pos * (yr - xr)) / (n - 1))).toFixed(0));
            green = parseInt((xg + ((pos * (yg - xg)) / (n - 1))).toFixed(0));
            blue = parseInt((xb + ((pos * (yb - xb)) / (n - 1))).toFixed(0));
            clr = 'rgb(' + red + ',' + green + ',' + blue + ')';
            $(this).css({ backgroundColor: clr });
        }
        else {
            var val = parseFloat($(this).text()) * (-1);
            var pos = parseFloat((Math.round((val / min) * 100)).toFixed(0));
            red = parseInt((xr + ((pos * (nr - xr)) / (n - 1))).toFixed(0));
            green = parseInt((xg + ((pos * (ng - xg)) / (n - 1))).toFixed(0));
            blue = parseInt((xb + ((pos * (nb - xb)) / (n - 1))).toFixed(0));
            clr = 'rgb(' + red + ',' + green + ',' + blue + ')';
            $(this).css({ backgroundColor: clr });
        }
    });
}
