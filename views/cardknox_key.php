<div class="app-page-title">
    <div class="page-title-wrapper">
        <div class="page-title-heading">
            <div class="page-title-icon">
                <i class="pe-7s-config text-success"></i>
            </div>
            <div>
                <?php echo l('Payment Gateway Settings'); ?>
            </div>
        </div>
    </div>
</div>
<div class="main-card card">
    <div class="card-body" >
		<div class="form-group rate-group text-center">
			<?php if(isset($transaction_key) && $transaction_key && isset($iFields_key) && $iFields_key){ ?>
			<div class="form-group">
				<label for="current_time" class="col-sm-3 control-label">
					<?php echo l('Current Payment Gateway');  ?>
				</label>
				<div class="col-sm-9">
					<select name="payment_gateways_name" class="form-control all_payment_gateways_update text-capitalize">
						<option value="">-- Payment Gateway Name --</option>
						<?php if($all_payment_gateways_detail): 
								?>
								<option value="<?php echo $all_payment_gateways_detail; ?>" 
									<?php echo isset($selected_payment_gateway) && $selected_payment_gateway == $all_payment_gateways_detail ? 'selected' : ''; ?>
									>
									<?php echo $all_payment_gateways_detail; ?>
								</option>
								<?php
					
							?>
						<?php endif; ?>
					</select>
				</div>
			</div>
			<?php  } ?>
			<br>
			<br>
			<br>

			<div class="form-group">
				<label for="" class="col-sm-3 control-label">
					iFields Key:
				</label>

				<div class="col-sm-9">
					<?php if(isset($iFields_key) && $iFields_key) {?>
						<input readonly type="text" name="iFields_key" class="form-control" value=<?php echo  $iFields_key ?>   >
					<?php }else{ ?>
						<input type="text" name="iFields_key" class="form-control" value=""   >
					<?php } ?>

				</div>
			</div>
			<br>
			<br>
			<div class="form-group">
				<label for="" class="col-sm-3 control-label">
					Transaction Key (xKey):
				</label>

				<div class="col-sm-9">
					<?php if(isset($transaction_key) && $transaction_key) {?>
						<input readonly type="text" name="transaction_key" class="form-control" value=<?php echo  $transaction_key ?>   >
					<?php }else{ ?>
						<input type="text" name="transaction_key" class="form-control" value=""   >
					<?php } ?>
				</div>
			</div>
			<br>
			<br>
			<br>
			<div class="form-group rate-group text-center">
				<div class="text-center">
					<?php if(isset($transaction_key) && $transaction_key && isset($iFields_key) && $iFields_key){ ?>
					
					<button type="button" class="btn btn-danger deconfigure-cardknox" ><?=l("Deconfigure");?></button>
					<?php } else { ?>

					<button type="button" class="btn btn-success login-cardknox" ><?=l("Sign in");?></button>

					<?php  } ?>

				</div>
			</div>
		</div>
    </div>
</div>
