import { Controller, Post, Body, Headers, RawBodyRequest, Req, UseGuards, Get, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StripeService } from './stripe.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';

@ApiTags('Stripe')
@Controller('stripe')
export class StripeController {
  constructor(private stripeService: StripeService) {}

  @Post('create-checkout-session')
  @ApiOperation({ summary: 'Create Stripe checkout session' })
  @ApiResponse({ status: 201, description: 'Checkout session created' })
  async createCheckoutSession(@Body() createCheckoutSessionDto: CreateCheckoutSessionDto) {
    return this.stripeService.createCheckoutSession(createCheckoutSessionDto);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Handle Stripe webhooks' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.stripeService.handleWebhook(req.rawBody.toString(), signature);
  }

  @Get('verify-session/:sessionId')
  @ApiOperation({ summary: 'Verify Stripe session and create subscription' })
  @ApiResponse({ status: 200, description: 'Session verified' })
  async verifySession(@Param('sessionId') sessionId: string) {
    return this.stripeService.verifySessionAndCreateSubscription(sessionId);
  }

  @Get('invoices/:customerId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get customer invoices' })
  @ApiResponse({ status: 200, description: 'Invoices retrieved' })
  async getInvoices(@Param('customerId') customerId: string) {
    return this.stripeService.getInvoices(customerId);
  }
}
