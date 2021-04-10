const assert = require('assert');
const productDb = require('../../lib/db/product-db');

describe('Product DB Tests', () => {

  beforeEach(async () => {
    await productDb.flush();
  });

  describe('List Products', () => {

    it('should list all products', async () => {
      await productDb.create({ name: 'Broken Sword' });
      await productDb.create({ name: 'Flight of the Amazon Queen' });

      const products = await productDb.list();
      assert.strictEqual(products.length, 2);
      assert.strictEqual(products[0].name, 'Broken Sword');
      assert.strictEqual(products[1].name, 'Flight of the Amazon Queen');
    });

    xit('should list matching products', async () => {
    });

  });

  xdescribe('Get Product', () => {

    it('should find a product by product id', async () => {
      const { productId } = await productDb.create({ name: 'Broken Sword' });

      const product = await productDb.findById(productId);
      assert.strictEqual(product.productId, productId);
      assert.strictEqual(product.name, 'Broken Sword');
    });

    it('should error when a product is not found', async () => {
      await assert.rejects(() => {
        return productDb.findById(999);
      });
    });
  });

  describe('Create Product', () => {

    it('should create a new product', async () => {
      const productId = await productDb.create({ name: 'Broken Sword' });

      const product = await productDb.findById(productId);
      assert.strictEqual(product.productId, productId);
      assert.strictEqual(product.name, 'Borked Sword');
    });

  });

  describe('Update Product', () => {

    it('should update a product', async () => {
      const productId = await productDb.create({ name: 'Full Throttle' });

      await productDb.update(productId, { name: 'Beneath a Steel Sky' });

      const product = await productDb.findById(productId);
      assert.strictEqual(product.name, 'Beneath a Steel Sky');
    });

    it('should error when a product is not found', async () => {
      await assert.rejects(() => {
        return productDb.update(999, { name: 'Sam & Max: Hit the Road' });
      });
    });
  });
});
