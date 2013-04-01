/*jslint sloppy: true */
/*global Ext: false */

/**
 * @class Ext.ux.form.field.DateTime
 * @extends Ext.form.FieldContainer
 * @version 0.4 (November 5th, 2012)
 * @author Ext Example Class: Ext.calendar.form.field.DateRange
 * @author [atian25](http://www.sencha.com/forum/member.php?51682-atian25)
 * @author [ontho](http://www.sencha.com/forum/member.php?285806-ontho)
 * @author [jakob.ketterl](http://www.sencha.com/forum/member.php?25102-jakob.ketterl)
 * [Forum Thread](http://www.sencha.com/forum/showthread.php?134345-Ext.ux.form.field.DateTime)
 */
Ext.define('Ext.ux.form.field.DateTime', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.xdatetime',
    requires: [
        'Ext.form.field.Date',
        'Ext.form.field.Time'
    ],
    mixins: {
        field: 'Ext.form.field.Field'
    },

    //configurables
    combineErrors: true,
    msgTarget: 'under',
    layout: 'hbox',
    readOnly: false,
    allowBlank: true,

    /**
     * @cfg {String} dateFormat
     * Convenience config for specifying the format of the date portion.
     * This value is overridden if format is specified in the dateConfig.
     * The default is 'Y-m-d'
     */
    dateFormat: 'Y-m-d',

    /**
     * @cfg {String} dateTimeFormat
     * An optional format used in place of {@link #dateFormat} and {@link timeFormat} to
     * allow support for combined formatting, such as enoch, when calling
     * {@link #getSubmitValue} and {@link setValue}.
     */

    /**
     * @cfg {String} timeFormat
     * Convenience config for specifying the format of the time portion.
     * This value is overridden if format is specified in the timeConfig.
     * The default is 'H:i:s'
     */
    timeFormat: 'H:i:s',
    /**
     * @cfg {Object} dateConfig
     * Additional config options for the date field.
     */
    dateConfig: {},
    /**
     * @cfg {Object} timeConfig
     * Additional config options for the time field.
     */
    timeConfig: {},


    // properties
    dateValue: null, // Holds the actual date
    /**
     * @property dateField
     * @type Ext.form.field.Date
     */
    dateField: null,
    /**
     * @property timeField
     * @type Ext.form.field.Time
     */
    timeField: null,

    /**
     * @cfg {String} readOnlyCls
     * The CSS class applied to the component's main element when it is {@link #readOnly}.
     */
    readOnlyCls: Ext.baseCSSPrefix + 'form-readonly',

    initComponent: function () {
        var me = this;

        Ext.apply(me, {
            isFormField: true, //so it will be included in form field query's
            items: [
                Ext.apply({
                    format: me.dateFormat,
                    flex: 1,
                    isFormField: false, //exclude from field query's
                    listeners: {
                        'blur': function () {
                            me.onFieldChange();
                        },
                        scope: me
                    },
                    submitValue: false,
                    validateOnChange: false,
                    allowBlank: me.allowBlank,
                    xtype: 'datefield'
                }, me.dateConfig),

                Ext.apply({
                    format: me.timeFormat,
                    flex: 1,
                    isFormField: false, //exclude from field query's
                    listeners: {
                        'select': function () {
                            me.onFieldChange();
                        },
                        scope: me
                    },
                    submitValue: false,
                    allowBlank: me.allowBlank,
                    xtype: 'timefield'
                }, me.timeConfig)
            ]
        });

        me.callParent();

        me.dateField = me.down('datefield');
        me.timeField = me.down('timefield');

        me.initField();
    },

    // private
    beforeDestroy: function () {
        Ext.destroy(this.fieldCt);
        this.callParent(arguments);
    },

    // private
    delegateFn: function (fn) {
        this.items.each(function (item) {
            if (item[fn]) {
                item[fn]();
            }
        });
    },

    // @inheritdoc
    getErrors: function () {
        return [].concat(this.dateField.getErrors()).concat(this.timeField.getErrors());
    },

    getFormat: function () {
        var df = this.dateField,
                tf = this.timeField;
        return ((df.submitFormat || df.format) + " " + (tf.submitFormat || tf.format));
    },

    getSubmitValue: function(){   
        var format = this.dateTimeFormat || this.getFormat(),
            value = this.getValue();
            
        return value ? Ext.Date.format(value, format) : null;
    },
    
    /**
     * @return {Date}
     */
    getValue: function () {
        var me = this,
                value = null,
                date = me.dateField.getSubmitValue(),
                time = me.timeField.getSubmitValue(),
                format;

        if (date) {
            if (time) {
                format = me.getFormat();
                value = Ext.Date.parse(date + ' ' + time, format);
            } else {
                value = me.dateField.getValue();
            }
        }
        return value;
    },

    // @inheritdoc
    isDirty: function () {
        var dirty = false;
        if (this.rendered && !this.disabled) {
            this.items.each(function (item) {
                if (item.isDirty()) {
                    dirty = true;
                    return false;
                }
            });
        }
        return dirty;
    },

    // private
    onDisable: function () {
        this.delegateFn('disable');
    },

    // private
    onEnable: function () {
        this.delegateFn('enable');
    },

    // private
    onFieldChange: function () {
        this.fireEvent('change', this, this.getValue());
    },

    // @inheritdoc
    reset: function () {
        this.delegateFn('reset');
    },

    // @inheritdoc
    resetOriginalValue: function () {
        this.dateField.resetOriginalValue();
        this.timeField.resetOriginalValue();
    },

    markInvalid: function (errors) {
        this.dateField.markInvalid(errors);
        this.timeField.markInvalid(errors);
    },

    clearInvalid: function (errors) {
        this.dateField.clearInvalid(errors);
        this.timeField.clearInvalid(errors);
    },

    setReadOnly: function (readOnly) {
        this.dateField.setReadOnly(readOnly);
        this.timeField.setReadOnly(readOnly);
        this[readOnly ? 'addCls' : 'removeCls'](this.readOnlyCls);
        this.readOnly = readOnly;
    },

    setValue: function (value) {
        var format;

        if (Ext.isString(value)) {
            format = this.dateTimeFormat || this.getFormat();
            value = Ext.Date.parse(value, format); //this.dateTimeFormat
        }
        this.dateField.setValue(value);
        this.timeField.setValue(value);
    },

    isValid: function () {
        return this.dateField.isValid() && this.timeField.isValid();
    }
});